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
class User < ApplicationRecord
  has_secure_password

  has_many :memberships, dependent: :destroy
  has_many :accounts, through: :memberships
  has_many :refresh_tokens, dependent: :destroy

  validates :email, presence: true,
            uniqueness: { case_sensitive: false },
            format: {
              with: URI::MailTo::EMAIL_REGEXP,
              message: "must be a valid email address"
            },
            length: { maximum: 255 }
  validates :password, presence: true,
            length: { minimum: 8, maximum: 128 },
            format: {
              with: /\A(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
              message: "must contain at least one lowercase letter, one uppercase letter, and one number"
            },
            if: :password_required?
  validates :full_name, presence: true, length: { minimum: 1, maximum: 100 }

  before_save :downcase_email
  before_create :generate_verification_token

  scope :verified, -> { where(email_verified: true) }

  def full_name
    self[:full_name]
  end

  def generate_verification_token!
    self.verification_token = SecureRandom.urlsafe_base64
    self.verification_sent_at = Time.current
    save!
  end

  def generate_reset_password_token!
    self.reset_password_token = SecureRandom.urlsafe_base64(32)
    self.reset_password_sent_at = Time.current
    save!
  end

  def reset_password_token_valid?
    reset_password_sent_at && reset_password_sent_at > 2.hours.ago
  end

  def verify_email!
    update!(
      email_verified: true,
      email_verified_at: Time.current,
      verification_token: nil
    )
  end


  def track_sign_in!(ip_address)
    update!(
      last_sign_in_at: Time.current,
      last_sign_in_ip: ip_address,
      sign_in_count: sign_in_count + 1
    )
  end

  private

  def downcase_email
    self.email = email.downcase if email.present?
  end

  def generate_verification_token
    self.verification_token = SecureRandom.urlsafe_base64
    self.verification_sent_at = Time.current
  end

  def password_required?
    new_record? || password.present?
  end
end
