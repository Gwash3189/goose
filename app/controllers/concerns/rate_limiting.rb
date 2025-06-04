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
      limit = 5
      window = 15.minutes
    when "register", "forgot_password"
      limit = 3
      window = 1.hour
    end

    if attempts >= limit
      render json: {
        error: "Too Many Requests",
        message: "Rate limit exceeded. Try again in #{window.inspect}."
      }, status: :too_many_requests
      return
    end

    Rails.cache.write(cache_key, attempts + 1, expires_in: window)
  end
end
