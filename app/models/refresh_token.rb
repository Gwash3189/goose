# == Schema Information
#
# Table name: refresh_tokens
#
#  id          :integer          not null, primary key
#  device_name :string
#  expires_at  :datetime         not null
#  ip_address  :string
#  token       :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  user_id     :integer          not null
#
# Indexes
#
#  index_refresh_tokens_on_expires_at  (expires_at)
#  index_refresh_tokens_on_token       (token) UNIQUE
#  index_refresh_tokens_on_user_id     (user_id)
#
# Foreign Keys
#
#  user_id  (user_id => users.id)
#
class RefreshToken < ApplicationRecord
  belongs_to :user

  validates :token, presence: true, uniqueness: true, length: { is: AppConfig::REFRESH_TOKEN_LENGTH }
  validates :expires_at, presence: true
  validates :device_name, length: { maximum: AppConfig::DEVICE_NAME_MAX_LENGTH }, allow_blank: true
  validates :ip_address, format: { with: AppConfig::IP_ADDRESS_REGEX, message: "must be a valid IP address" }, allow_blank: true

  scope :active, -> { where("expires_at > ?", Time.current) }

  before_validation :set_defaults, on: :create

  def expired?
    expires_at <= Time.current
  end

  private

  def set_defaults
    self.token ||= SecureRandom.urlsafe_base64(32)
    self.expires_at ||= AppConfig::REFRESH_TOKEN_EXPIRATION.from_now
  end
end
