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
FactoryBot.define do
  factory :refresh_token do
    association :user
    token { SecureRandom.urlsafe_base64(32) }
    expires_at { 30.days.from_now }
    device_name { Faker::Device.model_name }
    ip_address { Faker::Internet.ip_v4_address }

    trait :expired do
      expires_at { 1.day.ago }
    end
  end
end
