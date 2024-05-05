# == Schema Information
#
# Table name: accounts
#
#  id          :integer          not null, primary key
#  name        :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  customer_id :integer          not null
#
# Indexes
#
#  index_accounts_on_customer_id  (customer_id)
#  index_accounts_on_name         (name) UNIQUE
#
# Foreign Keys
#
#  customer_id  (customer_id => customers.id)
#
class Account < ApplicationRecord
  belongs_to :customer
  has_many :api_keys, as: :entity, dependent: :destroy
  has_many :users, dependent: :destroy
end
