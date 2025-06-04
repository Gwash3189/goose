class ApplicationController < ActionController::API
  include JsonWebToken

  before_action :authenticate_user!

  private

  def authenticate_user!
    header = request.headers['Authorization']
    header = header.split(' ').last if header

    begin
      decoded = jwt_decode(header)
      @current_user = User.find(decoded[:user_id])
      @current_account_id = decoded[:account_id]
    rescue ActiveRecord::RecordNotFound => e
      render json: { errors: ['User not found'] }, status: :unauthorized
    rescue JWT::DecodeError => e
      render json: { errors: ['Invalid token'] }, status: :unauthorized
    end
  end

  def current_user
    @current_user
  end

  def current_account
    @current_account ||= Account.find(@current_account_id) if @current_account_id
  end
end
