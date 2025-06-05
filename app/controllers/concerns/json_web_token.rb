# app/controllers/concerns/json_web_token.rb
module JsonWebToken
  extend ActiveSupport::Concern

  SECRET_KEY = Rails.application.credentials.secret_key_base.presence ||
               raise("JWT secret key not configured")

  def jwt_encode(payload, exp = AppConfig::JWT_EXPIRATION.from_now)
    payload[:exp] = exp.to_i
    payload[:iat] = Time.current.to_i

    # Include password change timestamp for security
    if payload[:user_id].present?
      user = User.find_by(id: payload[:user_id])
      payload[:pwd_changed_at] = user&.password_changed_at&.to_i
    end

    JWT.encode(payload, SECRET_KEY, AppConfig::JWT_ALGORITHM)
  end

  def jwt_decode(token)
    decoded = JWT.decode(token, SECRET_KEY, true, { algorithm: AppConfig::JWT_ALGORITHM })[0]
    HashWithIndifferentAccess.new(decoded)
  rescue JWT::ExpiredSignature
    raise JWT::ExpiredSignature, "Token has expired"
  rescue JWT::DecodeError => e
    raise JWT::DecodeError, "Invalid token: #{e.message}"
  end
end
