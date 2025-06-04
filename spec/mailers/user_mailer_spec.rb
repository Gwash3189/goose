require 'rails_helper'

RSpec.describe UserMailer, type: :mailer do
  let(:user) { create(:user, email: 'test@example.com', full_name: 'Test User') }
  let(:account) { create(:account, name: 'TestOrg') }
  let(:inviter) { create(:user, email: 'inviter@example.com', full_name: 'Inviter User') }
  let(:device_info) { { device_name: 'MacBook', ip_address: '1.2.3.4', location: 'USA' } }

  describe '#verification_email' do
    let(:mail) { described_class.verification_email(user) }

    it 'renders the subject' do
      expect(mail.subject).to eq('Please verify your email address')
    end

    it 'sends to the correct recipient' do
      expect(mail.to).to eq([ user.email ])
    end

    it 'includes the verification URL' do
      expect(mail.body.encoded).to include(user.verification_token)
      expect(mail.body.encoded).to include('verify-email')
    end
  end

  describe '#welcome_email' do
    let(:mail) { described_class.welcome_email(user) }

    it 'renders the subject' do
      expect(mail.subject).to eq("Welcome to YourApp!")
    end

    it 'sends to the correct recipient' do
      expect(mail.to).to eq([ user.email ])
    end

    it 'includes the login URL' do
      expect(mail.body.encoded).to include('/login')
    end
  end

  describe '#reset_password_email' do
    before { user.generate_reset_password_token! }
    let(:mail) { described_class.reset_password_email(user) }

    it 'renders the subject' do
      expect(mail.subject).to eq('Password reset instructions')
    end

    it 'sends to the correct recipient' do
      expect(mail.to).to eq([ user.email ])
    end

    it 'includes the reset password URL' do
      expect(mail.body.encoded).to include(user.reset_password_token)
      expect(mail.body.encoded).to include('reset-password')
    end
  end

  describe '#password_changed_email' do
    let(:mail) { described_class.password_changed_email(user) }

    it 'renders the subject' do
      expect(mail.subject).to eq('Your password has been changed')
    end

    it 'sends to the correct recipient' do
      expect(mail.to).to eq([ user.email ])
    end

    it 'includes the support email' do
      expect(mail.body.encoded).to include('support@yourapp.com')
    end
  end

  describe '#account_invitation_email' do
    let(:mail) { described_class.account_invitation_email(user, account, inviter) }

    it 'renders the subject' do
      expect(mail.subject).to eq("You've been invited to join #{account.name}")
    end

    it 'sends to the correct recipient' do
      expect(mail.to).to eq([ user.email ])
    end

    it 'includes the inviter name' do
      expect(mail.body.encoded).to include(inviter.full_name)
    end

    it 'does not include the inviter email (only name is shown)' do
      expect(mail.body.encoded).not_to include(inviter.email)
    end
  end

  describe '#new_device_login_email' do
    let(:mail) { described_class.new_device_login_email(user, device_info) }

    it 'renders the subject' do
      expect(mail.subject).to eq('New login to your account')
    end

    it 'sends to the correct recipient' do
      expect(mail.to).to eq([ user.email ])
    end

    it 'includes the device name and IP address' do
      expect(mail.body.encoded).to include(device_info[:device_name])
      expect(mail.body.encoded).to include(device_info[:ip_address])
    end
  end
end
