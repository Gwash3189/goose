class ApplicationController < ActionController::API
  include JsonWebToken

  before_action :authenticate_user!

  private

  def authenticate_user!
    token = extract_token_from_header
    return render_unauthorized("Missing authorization token") unless token

    begin
      decoded = jwt_decode(token)
      @current_user = User.find(decoded[:user_id])
      @current_account_id = decoded[:account_id]
    rescue ActiveRecord::RecordNotFound
      render_unauthorized("User not found")
    rescue JWT::ExpiredSignature
      render_unauthorized("Token has expired")
    rescue JWT::DecodeError => e
      render_unauthorized("Invalid token: #{e.message}")
    end
  end

  def extract_token_from_header
    header = request.headers["Authorization"]
    return nil unless header&.start_with?("Bearer ")
    header.split(" ").last
  end

  def render_unauthorized(message)
    render json: {
      error: "Unauthorized",
      message: message
    }, status: :unauthorized
  end

  def render_error(message, status = :unprocessable_entity)
    render json: {
      error: status.to_s.humanize,
      message: message
    }, status: status
  end

  def render_validation_errors(record)
    render json: {
      error: "Validation Failed",
      message: "The request contains invalid parameters",
      details: record.errors.as_json
    }, status: :unprocessable_entity
  end

  def current_user
    @current_user
  end

  def current_account
    @current_account ||= Account.find(@current_account_id) if @current_account_id
  end
end
