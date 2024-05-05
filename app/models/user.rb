# == Schema Information
#
# Table name: users
#
#  id         :integer          not null, primary key
#  email      :string           not null
#  name       :string           not null
#  password   :string           not null
#  created_at :datetime         not null
#  updated_at :datetime         not null
#  account_id :integer          not null
#
# Indexes
#
#  index_users_on_account_id  (account_id)
#  index_users_on_email       (email) UNIQUE
#
# Foreign Keys
#
#  account_id  (account_id => accounts.id)
#
class User < ApplicationRecord
  belongs_to :account
  has_many :api_keys, as: :entity, dependent: :destroy
end
