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

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }
  scope :expired, -> { where("expires_at <= ?", Time.current) }

  before_validation :set_defaults, on: :create

  def expired?
    expires_at <= Time.current
  end

  def self.cleanup_expired
    expired.destroy_all
  end

  private

  def set_defaults
    self.token ||= SecureRandom.urlsafe_base64(32)
    self.expires_at ||= 30.days.from_now
  end
end
