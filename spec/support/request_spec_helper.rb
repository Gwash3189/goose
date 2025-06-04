# spec/support/request_spec_helper.rb
module RequestSpecHelper
  # Parse JSON response to ruby hash
  def json_response
    JSON.parse(response.body)
  end

  # Helper method to generate a JWT token for testing authenticated requests
  def auth_headers(user, account_id = nil)
    token = jwt_encode(user_id: user.id, account_id: account_id)
    { 'Authorization' => "Bearer #{token}" }
  end

  # Helper for including the JsonWebToken module in tests
  def jwt_encode(payload, exp = 24.hours.from_now)
    payload[:exp] = exp.to_i
    secret_key = Rails.application.credentials.secret_key_base || Rails.application.secrets.secret_key_base
    JWT.encode(payload, secret_key)
  end
end
