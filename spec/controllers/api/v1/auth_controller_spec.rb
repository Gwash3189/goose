require 'rails_helper'

RSpec.describe Api::V1::AuthController, type: :controller do
  include ActiveJob::TestHelper

  before do
    # Clear job queue and deliveries before each test
    clear_enqueued_jobs
    ActionMailer::Base.deliveries.clear
  end

  describe 'POST #register' do
    let(:valid_params) do
      {
        email: 'test@example.com',
        password: "Password123",
        full_name: 'Test User'
      }
    end
    let(:account) { create(:account) }
    let(:user_params) do
      {
        email: 'newuser@example.com',
        password: "Password123",
        full_name: 'New User'
      }
    end

    context 'with valid parameters' do
      it 'creates a new user' do
        expect {
          post :register, params: valid_params, as: :json
        }.to change(User, :count).by(1)
      end

      it 'returns a created status' do
        post :register, params: valid_params, as: :json
        expect(response).to have_http_status(:created)
      end

      it 'returns a success message and user data' do
        post :register, params: valid_params, as: :json

        expect(json_response['message']).to include('Registration successful')
        expect(json_response['user']).to include('email' => 'test@example.com')
      end
    end

    context 'with invalid parameters' do
      let(:invalid_params) { valid_params.except(:email).merge(account_name: 'Test Account') }

      it 'does not create a new user' do
        expect {
          post :register, params: invalid_params, as: :json
        }.not_to change(User, :count)
      end

      it 'returns unprocessable entity status' do
        post :register, params: invalid_params, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns generic error message' do
        post :register, params: invalid_params, as: :json
        expect(json_response['message']).to include('Unable to create account')
      end
    end

    context 'when registering to a new account' do
      it 'creates a new user and account, assigns owner role, and sends verification email' do
        expect {
          post :register, params: user_params.merge(account_name: 'Test Account'), as: :json
        }.to change(User, :count).by(1).and change(Account, :count).by(1)

        user = User.find_by(email: user_params[:email])
        account = user.accounts.first
        expect(account).to be_present
        expect(account.memberships.find_by(user: user).role).to eq('owner')
        expect(response).to have_http_status(:created)
        expect(json_response['user']['email']).to eq(user.email)
        expect(json_response['account']['id']).to eq(account.id)
        expect(enqueued_jobs.size).to eq(1)
        expect(enqueued_jobs.first[:job]).to eq(ActionMailer::MailDeliveryJob)
      end
    end
    context 'when registering to an existing account' do
      before { create(:membership, user: create(:user), account: account, role: :owner) }
      it 'creates a new user as member and sends verification email' do
        expect {
          post :register, params: user_params.merge(account_id: account.id), as: :json
        }.to change(User, :count).by(1)

        user = User.find_by(email: user_params[:email])
        expect(user).to be_present
        expect(account.users).to include(user)
        expect(account.memberships.find_by(user: user).role).to eq('member')
        expect(response).to have_http_status(:created)
        expect(json_response['user']['email']).to eq(user.email)
        expect(json_response['account']['id']).to eq(account.id)
        expect(enqueued_jobs.size).to eq(1)
        expect(enqueued_jobs.first[:job]).to eq(ActionMailer::MailDeliveryJob)
      end
    end
    context 'when registering to a non-existent account' do
      it 'returns not found error' do
        post :register, params: user_params.merge(account_id: 999999), as: :json
        expect(response).to have_http_status(:not_found)
        expect(json_response['message']).to include('Account not found')
      end
    end

    context 'when user params are invalid' do
      it 'returns generic error message' do
        post :register, params: { email: '', password: '', account_name: 'Test Account' }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['message']).to include('Unable to create account')
      end
    end
  end

  describe 'POST #login' do
    let(:user) { create(:user, password: "Password123") }
    let(:verified_user) { create(:verified_user, password: "Password123") }
    let(:account) { create(:account) }
    let!(:membership) { create(:membership, user: verified_user, account: account) }

    context 'with valid credentials and verified email' do
      it 'returns an access token and refresh token' do
        post :login, params: {
          email: verified_user.email,
          password: "Password123",
          account_id: account.id,
          device_name: 'Test Device'
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response).to include('access_token', 'refresh_token', 'user')
      end

      it 'tracks sign in information' do
        post :login, params: {
          email: verified_user.email,
          password: "Password123",
          account_id: account.id
        }, as: :json
        verified_user.reload
        expect(verified_user.last_sign_in_at).not_to be_nil
        expect(verified_user.last_sign_in_ip).not_to be_nil
        expect(verified_user.sign_in_count).to eq(1)
      end

      it 'creates a refresh token' do
        expect {
          post :login, params: {
            email: verified_user.email,
            password: "Password123",
            account_id: account.id
          }, as: :json
        }.to change(RefreshToken, :count).by(1)
      end
    end

    context 'with valid credentials but unverified email' do
      it 'returns unauthorized status' do
        post :login, params: {
          email: user.email,
          password: "Password123",
          account_id: account.id
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['message']).to include('verify your email')
      end
    end

    context 'with invalid credentials' do
      it 'returns unauthorized status with wrong password' do
        post :login, params: {
          email: verified_user.email,
          password: 'wrongpassword',
          account_id: account.id
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
        expect(json_response['message']).to include('Invalid email or password')
      end

      it 'returns unauthorized status with non-existent email' do
        post :login, params: {
          email: 'nonexistent@example.com',
          password: "Password123",
          account_id: account.id
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST #logout' do
    let(:user) { create(:verified_user) }
    let!(:refresh_token) { create(:refresh_token, user: user) }

    before do
      # Only stub authentication to allow the test to reach the action
      allow(controller).to receive(:authenticate_user!).and_return(true)
      allow(controller).to receive(:current_user).and_return(user)
    end

    it 'destroys the refresh token' do
      expect {
        post :logout, params: { refresh_token: refresh_token.token }, as: :json
      }.to change(RefreshToken, :count).by(-1)
    end

    it 'returns a success message' do
      post :logout, params: { refresh_token: refresh_token.token }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response['message']).to include('Logged out successfully')
    end

    it 'handles invalid refresh tokens gracefully' do
      post :logout, params: { refresh_token: 'invalid-token' }, as: :json

      expect(response).to have_http_status(:ok)
    end
  end

  describe 'POST #refresh' do
    let(:user) { create(:verified_user) }
    let(:account) { create(:account) }
    let!(:membership) { create(:membership, user: user, account: account) }
    let!(:refresh_token) { create(:refresh_token, user: user) }
    let!(:expired_token) { create(:refresh_token, :expired, user: user) }

    context 'with a valid refresh token' do
      it 'returns a new access token' do
        post :refresh, params: {
          refresh_token: refresh_token.token,
          account_id: account.id
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response).to include('access_token', 'user')
      end
    end

    context 'with an expired refresh token' do
      it 'returns unauthorized status' do
        # Simulate an expired token by updating its expires_at
        expired_token.update!(expires_at: 1.hour.ago)
        post :refresh, params: {
          refresh_token: expired_token.token,
          account_id: account.id
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end

    context 'with an invalid refresh token' do
      it 'returns unauthorized status' do
        post :refresh, params: {
          refresh_token: 'invalid-token',
          account_id: account.id
        }, as: :json

        expect(response).to have_http_status(:unauthorized)
      end
    end
  end

  describe 'POST #verify_email' do
    let(:user) { create(:user) }

    context 'with a valid verification token' do
      it 'verifies the user email' do
        post :verify_email, params: { token: user.verification_token }, as: :json

        user.reload
        expect(user.email_verified).to be true
        expect(user.email_verified_at).not_to be_nil
        expect(user.verification_token).to be_nil
      end

      it 'returns a success message' do
        post :verify_email, params: { token: user.verification_token }, as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response['message']).to include('Email verified successfully')
      end
    end

    context 'with an invalid verification token' do
      it 'returns unprocessable entity status' do
        post :verify_email, params: { token: 'invalid-token' }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end

      it 'returns an error message' do
        post :verify_email, params: { token: 'invalid-token' }, as: :json

        expect(json_response['message']).to include('Invalid verification token')
      end
    end
  end

  describe 'POST #forgot_password' do
    let!(:user) { create(:user, email: 'test@example.com') }

    it 'generates a reset password token for existing user' do
      post :forgot_password, params: { email: user.email }, as: :json
      user.reload
      expect(user.reset_password_token).not_to be_nil
      expect(user.reset_password_sent_at).not_to be_nil
    end

    it 'returns a success message even for non-existent email' do
      post :forgot_password, params: { email: 'nonexistent@example.com' }, as: :json

      expect(response).to have_http_status(:ok)
      expect(json_response['message']).to include('If your email exists')
    end
  end

  describe 'POST #reset_password' do
    let(:user) { create(:user) }

    before do
      user.generate_reset_password_token!
      user.reload
    end

    context 'with a valid token' do
      it 'resets the user password' do
        post :reset_password, params: {
          token: user.reset_password_token,
          password: "NewPassword123"
        }, as: :json

        user.reload
        expect(user.reset_password_token).to be_nil
        expect(user.reset_password_sent_at).to be_nil
        expect(user.authenticate("NewPassword123")).to eq(user)
      end

      it 'returns a success message' do
        post :reset_password, params: {
          token: user.reset_password_token,
          password: "NewPassword123"
        }, as: :json

        expect(response).to have_http_status(:ok)
        expect(json_response['message']).to include('Password reset successfully')
      end
    end

    context 'with an expired token' do
      before { user.update(reset_password_sent_at: 3.hours.ago) }

      it 'returns unprocessable entity status' do
        post :reset_password, params: {
          token: user.reset_password_token,
          password: "NewPassword123"
        }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'with an invalid token' do
      it 'returns unprocessable entity status' do
        post :reset_password, params: {
          token: 'invalid-token',
          password: "NewPassword123"
        }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
      end
    end

    context 'with invalid password' do
      let(:user_with_token) { create(:user) }

      before { user_with_token.generate_reset_password_token! }

      it 'returns validation errors' do
        post :reset_password, params: {
          token: user_with_token.reset_password_token,
          password: "short"
        }, as: :json

        expect(response).to have_http_status(:unprocessable_entity)
        expect(json_response['details']['password']).to include('is too short (minimum is 8 characters)')
      end
    end
  end
end
