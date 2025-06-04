# spec/support/url_helpers.rb
module UrlHelpers
  def verify_email_url(token:)
    "http://localhost:3000/auth/verify-email?token=#{token}"
  end

  def login_url
    "http://localhost:3000/auth/login"
  end

  def reset_password_url(token:)
    "http://localhost:3000/auth/reset-password?token=#{token}"
  end

  def app_name
    "Goose"
  end
end

# Make the URL helpers available to UserMailer instances in tests
UserMailer.include(UrlHelpers) if defined?(UserMailer)
