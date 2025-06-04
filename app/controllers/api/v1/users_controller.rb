# app/controllers/api/v1/users_controller.rb
module Api
  module V1
    class UsersController < ApplicationController
      # GET /api/v1/users/me
      def me
        render json: current_user.as_json(
          only: [:id, :email, :full_name, :email_verified, :created_at],
          include: {
            accounts: {
              only: [:id, :name]
            }
          }
        )
      end

      # PATCH /api/v1/users/me
      def update
        if current_user.update(update_params)
          render json: current_user
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      # PATCH /api/v1/users/me/password
      def update_password
        if current_user.authenticate(password_params[:current_password])
          if current_user.update(password: password_params[:new_password])
            render json: { message: 'Password updated successfully' }
          else
            render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
          end
        else
          render json: { errors: ['Current password is incorrect'] }, status: :unprocessable_entity
        end
      end

      # GET /api/v1/accounts/:account_id/users
      def index
        account = Account.find_by(id: params[:account_id])
        return render json: { errors: ['Account not found'] }, status: :not_found unless account
        membership = account.memberships.find_by(user_id: current_user.id)
        unless membership&.admin? || membership&.owner?
          return render json: { errors: ['Forbidden'] }, status: :forbidden
        end
        users = account.users
        render json: users.as_json(only: [:id, :email, :full_name, :email_verified, :created_at])
      end

      private

      def update_params
        params.require(:user).permit(:full_name)
      end

      def password_params
        params.require(:user).permit(:current_password, :new_password)
      end
    end
  end
end
