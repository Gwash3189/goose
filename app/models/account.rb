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
class Account < ApplicationRecord
  has_many :memberships, dependent: :destroy
  has_many :users, through: :memberships

  validates :name, presence: true

  scope :active, -> { where(active: true) }

  def owner
    memberships.find_by(role: :owner)&.user
  end

  def add_user(user, role: :member)
    memberships.create!(user: user, role: role)
  end
end
