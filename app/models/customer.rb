# == Schema Information
#
# Table name: customers
#
#  id         :integer          not null, primary key
#  email      :string
#  name       :string
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_customers_on_email  (email) UNIQUE
#
class Customer < ApplicationRecord
  has_many :api_keys, as: :entity, dependent: :destroy
  has_many :accounts, dependent: :destroy

  validates :name, presence: true
  validates :email, presence: true
end
