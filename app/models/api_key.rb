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

  validates :entity, presence: true
  validates :key, presence: true
  validates :expires_at, presence: true
  validates :expired, inclusion: { in: [true, false] }

  def self.generate(entity:, expires_at: 1.year.from_now)
    raw_key = SecureRandom.uuid
    record = ApiKey.create(
      entity: entity,
      expired: false,
      expires_at: expires_at,
      key: BCrypt::Password.create(raw_key)
    )

    {
      record:,
      raw_key: raw_key
    }
  end

  def self.create_key
    raw_key = SecureRandom.uuid
    {
      raw_key:,
      key: BCrypt::Password.create(raw_key)
    }
  end

  def self.find_by_key(key)
    find_by(key: key)
  end

  def self.find_by_key!(key)
    find_by!(key: key)
  end

  def expired?
    expires_at < Time.zone.now
  end

  def expire!
    update!(expired: true)
  end
end
