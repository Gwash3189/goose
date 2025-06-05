# app/controllers/concerns/rate_limiting.rb
module RateLimiting
  extend ActiveSupport::Concern

  included do
    before_action :check_rate_limit, only: [ :login, :register, :forgot_password ]
  end

  private

  def check_rate_limit
    cache_key = "rate_limit:#{action_name}:#{request.remote_ip}"
    attempts = Rails.cache.read(cache_key) || 0

    case action_name
    when "login"
      limit = AppConfig::RATE_LIMIT_LOGIN_ATTEMPTS
      window = AppConfig::RATE_LIMIT_LOGIN_WINDOW
    when "register", "forgot_password"
      limit = AppConfig::RATE_LIMIT_REGISTRATION_ATTEMPTS
      window = AppConfig::RATE_LIMIT_REGISTRATION_WINDOW
    end

    if attempts >= limit
      render_error("Rate limit exceeded. Try again in #{window.inspect}.", :too_many_requests)
      return
    end

    Rails.cache.write(cache_key, attempts + 1, expires_in: window)
  end
end
