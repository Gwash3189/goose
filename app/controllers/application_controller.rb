class ApplicationController < ActionController::API
  include JsonWebToken

  before_action :authenticate_user!

  private

  def user_json(user, options = {})
    json = {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      email_verified: user.email_verified,
      created_at: user.created_at
    }

    if options[:include_accounts]
      json[:accounts] = user.accounts.active.map do |account|
        {
          id: account.id,
          name: account.name,
          role: user.memberships.find_by(account: account)&.role
        }
      end
    end

    json
  end

  def authenticate_user!
    token = extract_token_from_header
    return render_unauthorized("Missing authorization token") unless token

    begin
      decoded = jwt_decode(token)
      @current_user = User.find(decoded[:user_id])
      @current_account_id = decoded[:account_id]

      # Check if password has been changed since token was issued
      token_pwd_changed_at = decoded[:pwd_changed_at]
      if token_pwd_changed_at && @current_user.password_changed_at
        user_pwd_changed_at = @current_user.password_changed_at.to_i

        if user_pwd_changed_at > token_pwd_changed_at
          render_unauthorized("Token invalidated due to password change")
        end
      end

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
