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

  validates :name, presence: true,
                   length: { minimum: AppConfig::ACCOUNT_NAME_MIN_LENGTH, maximum: AppConfig::ACCOUNT_NAME_MAX_LENGTH },
                   format: { with: AppConfig::ACCOUNT_NAME_REGEX, message: "can only contain letters, numbers, spaces, hyphens, underscores, and periods" },
                   uniqueness: { case_sensitive: false }

  scope :active, -> { where(active: true) }

  def owner
    memberships.find_by(role: :owner)&.user
  end
end
