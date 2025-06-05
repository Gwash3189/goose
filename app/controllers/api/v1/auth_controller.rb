# app/controllers/api/v1/auth_controller.rb
module Api
  module V1
    class AuthController < ApplicationController
      include RateLimiting

      skip_before_action :authenticate_user!, only: [ :register, :login, :logout, :verify_email, :forgot_password, :reset_password, :refresh ]

      # POST /api/v1/auth/register
      def register
        # Check if email already exists FIRST to prevent enumeration and account pollution
        if User.exists?(email: params[:email]&.downcase)
          # Return success message to prevent email enumeration
          render json: {
            message: "Registration successful. Please check your email to verify your account."
          }, status: :created
          return
        end

        ActiveRecord::Base.transaction do
          if params[:account_id].present?
            account = Account.find_by(id: params[:account_id])
            return render_error("Account not found", :not_found) unless account
          else
            account = Account.create!(name: params[:account_name] || params[:email])
          end

          user = User.new(user_params)
          if user.save
            # Add user to account as owner if new account, or member if joining existing
            role = account.memberships.count.zero? ? :owner : :member
            account.memberships.create!(user: user, role: role)
            UserMailer.verification_email(user).deliver_later
            render json: {
              message: "Registration successful. Please check your email to verify your account.",
              user: user_json(user),
              account: { id: account.id, name: account.name }
            }, status: :created
          else
            # Don't leak specific validation errors that could reveal system information
            render json: {
              error: "Registration Failed",
              message: "Unable to create account. Please check your information and try again."
            }, status: :unprocessable_entity
          end
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: params[:email]&.downcase)

        # Always perform password hashing to prevent timing attacks
        if user
          password_valid = user.authenticate(params[:password])
        else
          # Perform dummy password check to prevent timing attacks
          BCrypt::Password.create(params[:password])
          password_valid = false
        end

        if user && password_valid
          unless user.email_verified?
            return render_unauthorized("Please verify your email address")
          end

          user.track_sign_in!(request.remote_ip)

          # Check for new device notification before creating refresh token
          should_notify_new_device = should_send_new_device_notification?(user, request.remote_ip, params[:device_name])

          # Generate tokens
          access_token = jwt_encode(user_id: user.id, account_id: params[:account_id])
          refresh_token = user.refresh_tokens.create!(
            device_name: params[:device_name],
            ip_address: request.remote_ip
          )

          # Send new device notification if different IP/device
          if should_notify_new_device
            UserMailer.new_device_login_email(user, {
              device_name: params[:device_name],
              ip_address: request.remote_ip
            }).deliver_later
          end

          render json: {
            access_token: access_token,
            refresh_token: refresh_token.token,
            user: user_json(user)
          }
        else
          render_unauthorized("Invalid email or password")
        end
      end

      # POST /api/v1/auth/logout
      def logout
        refresh_token = RefreshToken.find_by(token: params[:refresh_token])
        refresh_token&.destroy

        render json: { message: "Logged out successfully" }
      end

      # POST /api/v1/auth/refresh
      def refresh
        refresh_token = RefreshToken.active.find_by(token: params[:refresh_token])

        if refresh_token
          user = refresh_token.user
          access_token = jwt_encode(user_id: user.id, account_id: params[:account_id])

          render json: {
            access_token: access_token,
            user: user_json(user)
          }
        else
          render_unauthorized("Invalid or expired refresh token")
        end
      end

      # POST /api/v1/auth/verify-email
      def verify_email
        user = User.find_by(verification_token: params[:token])

        if user
          user.verify_email!
          render json: { message: "Email verified successfully" }
        else
          render_error("Invalid verification token", :unprocessable_entity)
        end
      end

      # POST /api/v1/auth/forgot-password
      def forgot_password
        user = User.find_by(email: params[:email]&.downcase)

        if user
          user.generate_reset_password_token!
          # Send reset password email (implement mailer)
          UserMailer.reset_password_email(user).deliver_later
        end

        # Always return success to prevent email enumeration
        render json: { message: "If your email exists in our system, you will receive a password reset link" }
      end

      # POST /api/v1/auth/reset-password
      def reset_password
        user = User.find_by(reset_password_token: params[:token])

        unless user&.reset_password_token_valid?
          return render_error("Invalid or expired reset token", :unprocessable_entity)
        end

        if user.update(password: params[:password])
          user.update!(reset_password_token: nil, reset_password_sent_at: nil)
          UserMailer.password_changed_email(user).deliver_later
          render json: { message: "Password reset successfully" }
        else
          render_validation_errors(user)
        end
      end

      private

      def user_params
        params.permit(:email, :password, :full_name)
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          email_verified: user.email_verified,
          created_at: user.created_at
        }
      end

      def should_send_new_device_notification?(user, ip_address, device_name)
        # Send notification if this is a new IP address or device
        recent_login = user.refresh_tokens
                          .where("created_at > ?", 24.hours.ago)
                          .where(ip_address: ip_address, device_name: device_name)
                          .exists?

        !recent_login
      end
    end
  end
end
