# == Schema Information
#
# Table name: memberships
#
#  id         :integer          not null, primary key
#  active     :boolean          default(TRUE)
#  role       :integer          default("owner"), not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  account_id :integer          not null
#  user_id    :integer          not null
#
# Indexes
#
#  index_memberships_on_account_id              (account_id)
#  index_memberships_on_account_id_and_user_id  (account_id,user_id) UNIQUE
#  index_memberships_on_role                    (role)
#  index_memberships_on_user_id                 (user_id)
#
# Foreign Keys
#
#  account_id  (account_id => accounts.id)
#  user_id     (user_id => users.id)
#
FactoryBot.define do
  factory :membership do
    association :account
    association :user
    role { :member }
    active { true }

    trait :owner do
      role { :owner }
    end

    trait :admin do
      role { :admin }
    end

    trait :inactive do
      active { false }
    end
  end
end
