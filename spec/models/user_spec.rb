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
require 'rails_helper'

RSpec.describe User, type: :model do
  describe 'validations' do
    it 'is valid with valid attributes' do
      user = build(:user)
      expect(user).to be_valid
    end

    it 'is not valid without an email' do
      user = build(:user, email: nil)
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it 'is not valid with a duplicate email' do
      create(:user, email: 'duplicate@example.com')
      user = build(:user, email: 'duplicate@example.com')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("has already been taken")
    end

    it 'is not valid with an invalid email format' do
      user = build(:user, email: 'invalid_email')
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("is invalid")
    end

    it 'is not valid without a password for a new record' do
      user = build(:user, password: nil)
      expect(user).not_to be_valid
      expect(user.errors[:password]).to include("can't be blank")
    end

    it 'is not valid with a short password' do
      user = build(:user, password: 'short')
      expect(user).not_to be_valid
      expect(user.errors[:password]).to include("is too short (minimum is 8 characters)")
    end
  end

  describe 'callbacks' do
    context 'before_save' do
      it 'downcases email before saving' do
        user = create(:user, :with_uppercase_email)
        expect(user.email).to eq(user.email.downcase)
      end
    end

    context 'before_create' do
      it 'generates verification token before creating' do
        user = create(:user)
        expect(user.verification_token).not_to be_nil
        expect(user.verification_sent_at).not_to be_nil
      end
    end
  end

  describe '#full_name' do
    it 'returns the full_name field' do
      user = build(:user, full_name: 'Test User')
      expect(user.full_name).to eq('Test User')
    end
  end

  describe '#generate_verification_token!' do
    it 'sets a new verification token and timestamp' do
      user = create(:user)
      original_token = user.verification_token
      original_timestamp = user.verification_sent_at

      # Wait a moment to ensure timestamps differ
      sleep(0.1)

      user.generate_verification_token!

      expect(user.verification_token).not_to eq(original_token)
      expect(user.verification_sent_at).not_to eq(original_timestamp)
    end
  end

  describe '#generate_reset_password_token!' do
    it 'sets a reset password token and timestamp' do
      user = create(:user)

      user.generate_reset_password_token!

      expect(user.reset_password_token).not_to be_nil
      expect(user.reset_password_sent_at).not_to be_nil
    end
  end

  describe '#verify_email!' do
    it 'marks email as verified and removes verification token' do
      user = create(:user)

      user.verify_email!

      expect(user.email_verified).to be true
      expect(user.email_verified_at).not_to be_nil
      expect(user.verification_token).to be_nil
    end
  end

  describe '#reset_password!' do
    it 'updates password and removes reset token information' do
      user = create(:user, :with_reset_token)

      new_password = 'new_secret_password'
      user.reset_password!(new_password)

      expect(user.reset_password_token).to be_nil
      expect(user.reset_password_sent_at).to be_nil
      expect(user.authenticate(new_password)).to eq(user)
    end
  end

  describe '#track_sign_in!' do
    it 'updates sign-in tracking information' do
      user = create(:user)
      ip = '192.168.1.1'

      freeze_time = Time.current
      allow(Time).to receive(:current).and_return(freeze_time)

      user.track_sign_in!(ip)

      expect(user.last_sign_in_at).to eq(freeze_time)
      expect(user.last_sign_in_ip).to eq(ip)
      expect(user.sign_in_count).to eq(1)
    end
  end

  describe 'has_secure_password' do
    it 'encrypts password' do
      user = create(:user, password: 'password123')
      expect(user.password_digest).not_to eq('password123')
    end

    it 'can authenticate with correct password' do
      user = create(:user, password: 'password123')
      expect(user.authenticate('password123')).to eq(user)
    end

    it 'cannot authenticate with incorrect password' do
      user = create(:user, password: 'password123')
      expect(user.authenticate('wrong_password')).to be false
    end
  end

  describe 'associations' do
    it 'has many memberships' do
      association = User.reflect_on_association(:memberships)
      expect(association.macro).to eq(:has_many)
      expect(association.options[:dependent]).to eq(:destroy)
    end

    it 'has many accounts through memberships' do
      association = User.reflect_on_association(:accounts)
      expect(association.macro).to eq(:has_many)
      expect(association.options[:through]).to eq(:memberships)
    end

    it 'has many refresh tokens' do
      association = User.reflect_on_association(:refresh_tokens)
      expect(association.macro).to eq(:has_many)
      expect(association.options[:dependent]).to eq(:destroy)
    end
  end

  describe 'scopes' do
    it 'verified scope returns only verified users' do
      verified_user = create(:verified_user)
      unverified_user = create(:user)

      expect(User.verified).to include(verified_user)
      expect(User.verified).not_to include(unverified_user)
    end
  end
end
