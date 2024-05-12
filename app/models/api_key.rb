# == Schema Information
#
# Table name: api_keys
#
#  id          :integer          not null, primary key
#  entity_type :string           not null
#  expired     :boolean          default(FALSE)
#  expires_at  :datetime
#  key         :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  entity_id   :integer          not null
#
# Indexes
#
#  index_api_keys_on_entity  (entity_type,entity_id)
#  index_api_keys_on_key     (key) UNIQUE
#
class ApiKey < ApplicationRecord
  belongs_to :entity, polymorphic: true
  HMAC_SECRET_KEY = Rails.configuration.credentials.api_key_hmac_secret

  validates :entity, presence: true
  validates :key, presence: true
  validates :expires_at, presence: true
  validates :expired, inclusion: { in: [true, false] }

  before_create :generate_raw_key
  after_initialize :set_defaults

  attr_accessor :raw_key

  def self.find_by_key(key)
    find_by(key: BCrypt::Password.create(key))
  end

  def self.find_by_key!(key)
    find_by!(key: key)
  end

  def self.hash_raw_key(raw_key)
    OpenSSL::HMAC.hexdigest(
      "SHA256",
      HMAC_SECRET_KEY,
      raw_key
    )
  end

  def expire!
    update!(expired: true, expired_at: 1.second.ago)
  end

  private

  def generate_raw_key
    self.raw_key = SecureRandom.uuid_v4 unless key.present?
  end

  def set_defaults
    self.expired = false unless expired.present?
    self.expires_at = 1.year.from_now unless expires_at.present?
  end

  def hash_raw_key
    self.key = self.class.hash_raw_key(self.raw_key)
  end
end
