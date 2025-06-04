# app/controllers/api/v1/auth_controller.rb
module Api
  module V1
    class AuthController < ApplicationController
      skip_before_action :authenticate_user!, only: [:register, :login, :verify_email, :forgot_password, :reset_password, :refresh]

      # POST /api/v1/auth/register
      def register
        ActiveRecord::Base.transaction do
          if params[:account_id].present?
            account = Account.find_by(id: params[:account_id])
            return render json: { errors: ['Account not found'] }, status: :not_found unless account
          else
            account = Account.create!(name: params[:account_name] || params[:email])
          end

          user = User.new(user_params)
          if user.save
            # Add user to account as owner if new account, or member if joining existing
            role = account.memberships.count.zero? ? :owner : :member
            account.memberships.create!(user: user, role: role)
            UserMailer.verification_email(user).deliver_now
            render json: {
              message: 'Registration successful. Please check your email to verify your account.',
              user: user_json(user),
              account: { id: account.id, name: account.name }
            }, status: :created
          else
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        end
      end

      # POST /api/v1/auth/login
      def login
        user = User.find_by(email: params[:email]&.downcase)

        if user&.authenticate(params[:password])
          unless user.email_verified?
            return render json: { errors: ['Please verify your email address'] }, status: :unauthorized
          end

          user.track_sign_in!(request.remote_ip)

          # Generate tokens
          access_token = jwt_encode(user_id: user.id, account_id: params[:account_id])
          refresh_token = user.refresh_tokens.create!(
            device_name: params[:device_name],
            ip_address: request.remote_ip
          )

          render json: {
            access_token: access_token,
            refresh_token: refresh_token.token,
            user: user_json(user)
          }
        else
          render json: { errors: ['Invalid email or password'] }, status: :unauthorized
        end
      end

      # POST /api/v1/auth/logout
      def logout
        refresh_token = RefreshToken.find_by(token: params[:refresh_token])
        refresh_token&.destroy

        render json: { message: 'Logged out successfully' }
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
          render json: { errors: ['Invalid or expired refresh token'] }, status: :unauthorized
        end
      end

      # POST /api/v1/auth/verify-email
      def verify_email
        user = User.find_by(verification_token: params[:token])

        if user
          user.verify_email!
          render json: { message: 'Email verified successfully' }
        else
          render json: { errors: ['Invalid verification token'] }, status: :unprocessable_entity
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
        render json: { message: 'If your email exists in our system, you will receive a password reset link' }
      end

      # POST /api/v1/auth/reset-password
      def reset_password
        user = User.find_by(reset_password_token: params[:token])

        if user && user.reset_password_sent_at > 2.hours.ago
          begin
            user.reset_password!(params[:password])
            render json: { message: 'Password reset successfully' }
          rescue ActiveRecord::RecordInvalid
            render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { errors: ['Invalid or expired reset token'] }, status: :unprocessable_entity
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
    end
  end
end
