# app/controllers/api/v1/users_controller.rb
module Api
  module V1
    class UsersController < ApplicationController
      # GET /api/v1/users/me
      def me
        render json: current_user.as_json(
          only: [ :id, :email, :full_name, :email_verified, :created_at ],
          include: {
            accounts: {
              only: [ :id, :name ]
            }
          }
        )
      end

      # PATCH /api/v1/users/me
      def update
        if current_user.update(update_params)
          render json: user_json(current_user)
        else
          render_validation_errors(current_user)
        end
      end

      # PATCH /api/v1/users/me/password
      def update_password
        unless current_user.authenticate(password_params[:current_password])
          return render_error("Current password is incorrect", :unprocessable_entity)
        end

        if current_user.update(password: password_params[:new_password])
          # Invalidate all refresh tokens to force re-login on all devices
          current_user.refresh_tokens.destroy_all

          # Send notification email
          UserMailer.password_changed_email(current_user).deliver_later

          render json: { message: "Password updated successfully" }
        else
          render_validation_errors(current_user)
        end
      end

      # GET /api/v1/accounts/:account_id/users
      def index
        account = Account.find_by(id: params[:account_id])
        return render_error("Account not found", :not_found) unless account
        membership = account.memberships.find_by(user_id: current_user.id)
        unless membership&.admin? || membership&.owner?
          return render_error("Forbidden", :forbidden)
        end
        users = account.users
        render json: users.as_json(only: [ :id, :email, :full_name, :email_verified, :created_at ])
      end

      private

      def update_params
        params.require(:user).permit(:full_name)
      end

      def password_params
        params.require(:user).permit(:current_password, :new_password)
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
