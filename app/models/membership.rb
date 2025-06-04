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
class Membership < ApplicationRecord
  enum :role, { owner: 0, admin: 1, member: 2 }

  belongs_to :account
  belongs_to :user

  validates :user_id, uniqueness: { scope: :account_id }

  scope :active, -> { where(active: true) }
  scope :owners, -> { where(role: :owner) }
  scope :admins, -> { where(role: [:owner, :admin]) }
end
