# == Schema Information
#
# Table name: users
#
#  id                     :integer          not null, primary key
#  email                  :string           not null
#  email_verified         :boolean          default(FALSE)
#  email_verified_at      :datetime
#  first_name             :string
#  last_name              :string
#  last_sign_in_at        :datetime
#  last_sign_in_ip        :string
#  password_digest        :string           not null
#  reset_password_sent_at :datetime
#  reset_password_token   :string
#  sign_in_count          :integer          default(0)
#  verification_sent_at   :datetime
#  verification_token     :string
#  created_at             :datetime         not null
#  updated_at             :datetime         not null
#
# Indexes
#
#  index_users_on_email                 (email) UNIQUE
#  index_users_on_reset_password_token  (reset_password_token) UNIQUE
#  index_users_on_verification_token    (verification_token) UNIQUE
#
FactoryBot.define do
  factory :user do
    email { Faker::Internet.email }
    password { "Password123" }
    full_name { Faker::Name.name }
    email_verified { false }

    trait :verified do
      email_verified { true }
      email_verified_at { Time.current }
      verification_token { nil }
    end

    trait :with_reset_token do
      reset_password_token { SecureRandom.urlsafe_base64 }
      reset_password_sent_at { Time.current }
    end

    trait :with_uppercase_email do
      email { "#{Faker::Internet.user_name}@EXAMPLE.COM" }
    end

    factory :verified_user do
      verified
    end
  end
end
