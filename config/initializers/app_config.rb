# Centralized application configuration
class AppConfig
  # JWT Configuration
  JWT_ALGORITHM = "HS256"
  JWT_EXPIRATION = 24.hours

  # Rate Limiting Configuration
  RATE_LIMIT_LOGIN_ATTEMPTS = 5
  RATE_LIMIT_LOGIN_WINDOW = 15.minutes
  RATE_LIMIT_REGISTRATION_ATTEMPTS = 3
  RATE_LIMIT_REGISTRATION_WINDOW = 1.hour

  # Password Configuration
  PASSWORD_RESET_VALIDITY = 2.hours
  PASSWORD_MIN_LENGTH = 8
  PASSWORD_MAX_LENGTH = 128

  # Token Configuration
  VERIFICATION_TOKEN_LENGTH = 22
  RESET_PASSWORD_TOKEN_LENGTH = 43
  REFRESH_TOKEN_LENGTH = 43
  REFRESH_TOKEN_EXPIRATION = 30.days

  # User Validation Configuration
  USER_EMAIL_MAX_LENGTH = 255
  USER_FULL_NAME_MIN_LENGTH = 1
  USER_FULL_NAME_MAX_LENGTH = 100

  # Account Validation Configuration
  ACCOUNT_NAME_MIN_LENGTH = 1
  ACCOUNT_NAME_MAX_LENGTH = 255

  # Device Configuration
  DEVICE_NAME_MAX_LENGTH = 255
  NEW_DEVICE_CHECK_WINDOW = 24.hours

  # Common Regex Patterns
  IP_ADDRESS_REGEX = /\A(?:[0-9]{1,3}\.){3}[0-9]{1,3}\z|(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\z/
  FULL_NAME_REGEX = /\A[a-zA-Z\s\-'\.]+\z/
  ACCOUNT_NAME_REGEX = /\A[a-zA-Z0-9\s\-_\.]+\z/

  # Environment variable access with defaults
  def self.app_name
    ENV.fetch("APP_NAME", "YourApp")
  end

  def self.frontend_url
    ENV.fetch("FRONTEND_URL", "http://localhost:3001")
  end

  def self.support_email
    ENV.fetch("SUPPORT_EMAIL", "support@yourapp.com")
  end

  def self.default_from_email
    ENV.fetch("DEFAULT_FROM_EMAIL", "noreply@yourapp.com")
  end

  def self.app_host
    ENV.fetch("APP_HOST", "localhost:3000")
  end
end
