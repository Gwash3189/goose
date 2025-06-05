# == Schema Information
#
# Table name: accounts
#
#  id         :integer          not null, primary key
#  active     :boolean          default(TRUE)
#  name       :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
FactoryBot.define do
  factory :account do
    name { "#{Faker::Company.name.gsub(/[^a-zA-Z0-9\s\-_\.]/, '')}" }
    active { true }
  end
end
