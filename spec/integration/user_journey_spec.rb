require 'rails_helper'

RSpec.describe 'User Journey End-to-End', type: :request do
  include ActiveJob::TestHelper

  before do
    # Clear any existing data and jobs
    clear_enqueued_jobs
    ActionMailer::Base.deliveries.clear
  end

  describe 'Complete user lifecycle' do
    it 'successfully completes the full user journey' do
      # ============================================================================
      # Step 1: Register first user (will become account owner)
      # ============================================================================

      registration_params = {
        email: 'owner@example.com',
        password: 'SecurePass123',
        full_name: 'Account Owner',
        account_name: 'Tech Company Inc'
      }

      post '/api/v1/auth/register', params: registration_params, as: :json

      expect(response).to have_http_status(:created)

      registration_response = JSON.parse(response.body)
      expect(registration_response['message']).to include('Registration successful')
      expect(registration_response['user']['email']).to eq('owner@example.com')
      expect(registration_response['user']['email_verified']).to be_falsey
      expect(registration_response['account']['name']).to eq('Tech Company Inc')

      # Verify user and account were created
      user = User.find_by(email: 'owner@example.com')
      account = Account.find_by(name: 'Tech Company Inc')
      membership = account.memberships.find_by(user: user)

      expect(user).to be_present
      expect(account).to be_present
      expect(membership.role).to eq('owner')
      expect(user.email_verified).to be_falsey

      # Verify verification email was enqueued
      expect(enqueued_jobs.size).to eq(1)
      expect(enqueued_jobs.first[:job]).to eq(ActionMailer::MailDeliveryJob)

      # ============================================================================
      # Step 2: Attempt login before email verification (should fail)
      # ============================================================================

      post '/api/v1/auth/login', params: {
        email: 'owner@example.com',
        password: 'SecurePass123',
        account_id: account.id,
        device_name: 'Test Device'
      }, as: :json

      expect(response).to have_http_status(:unauthorized)
      login_error = JSON.parse(response.body)
      expect(login_error['message']).to include('verify your email')

      # ============================================================================
      # Step 3: Verify email address
      # ============================================================================

      verification_token = user.verification_token
      expect(verification_token).to be_present

      post '/api/v1/auth/verify-email', params: {
        token: verification_token
      }, as: :json

      expect(response).to have_http_status(:ok)
      verify_response = JSON.parse(response.body)
      expect(verify_response['message']).to include('Email verified successfully')

      # Verify user is now verified
      user.reload
      expect(user.email_verified).to be_truthy
      expect(user.verification_token).to be_nil

      # ============================================================================
      # Step 4: Login successfully after verification
      # ============================================================================

      clear_enqueued_jobs # Clear previous jobs

      post '/api/v1/auth/login', params: {
        email: 'owner@example.com',
        password: 'SecurePass123',
        account_id: account.id,
        device_name: 'MacBook Pro'
      }, as: :json

      expect(response).to have_http_status(:ok)
      login_response = JSON.parse(response.body)

      expect(login_response['access_token']).to be_present
      expect(login_response['refresh_token']).to be_present
      expect(login_response['user']['email']).to eq('owner@example.com')

      access_token = login_response['access_token']
      refresh_token = login_response['refresh_token']

      # Verify refresh token was created
      expect(user.refresh_tokens.count).to eq(1)
      expect(user.refresh_tokens.first.device_name).to eq('MacBook Pro')

      # Since this is a new device, should enqueue new device notification
      expect(enqueued_jobs.size).to eq(1)

      # ============================================================================
      # Step 5: Access protected endpoint (get current user)
      # ============================================================================

      get '/api/v1/users/me', headers: {
        'Authorization' => "Bearer #{access_token}"
      }

      expect(response).to have_http_status(:ok)
      me_response = JSON.parse(response.body)
      expect(me_response['email']).to eq('owner@example.com')
      expect(me_response['accounts']).to be_present
      expect(me_response['accounts'].first['name']).to eq('Tech Company Inc')

      # ============================================================================
      # Step 6: Update user profile
      # ============================================================================

      patch '/api/v1/users/me',
        params: {
          user: {
            full_name: 'Updated Owner Name'
          }
        },
        headers: {
          'Authorization' => "Bearer #{access_token}"
        },
        as: :json

      expect(response).to have_http_status(:ok)
      update_response = JSON.parse(response.body)
      expect(update_response['full_name']).to eq('Updated Owner Name')

      # ============================================================================
      # Step 7: Change password
      # ============================================================================

      clear_enqueued_jobs # Clear previous jobs

      patch '/api/v1/users/me/password',
        params: {
          user: {
            current_password: 'SecurePass123',
            new_password: 'NewSecurePass456'
          }
        },
        headers: {
          'Authorization' => "Bearer #{access_token}"
        },
        as: :json

      expect(response).to have_http_status(:ok)
      password_response = JSON.parse(response.body)
      expect(password_response['message']).to include('Password updated successfully')

      # Verify old refresh tokens were invalidated
      expect(user.refresh_tokens.count).to eq(0)

      # Verify password change notification was enqueued
      expect(enqueued_jobs.size).to eq(1)

      # Verify old access token no longer works
      get '/api/v1/users/me', headers: {
        'Authorization' => "Bearer #{access_token}"
      }
      expect(response).to have_http_status(:unauthorized)

      # ============================================================================
      # Step 8: Login with new password
      # ============================================================================

      post '/api/v1/auth/login', params: {
        email: 'owner@example.com',
        password: 'NewSecurePass456',
        account_id: account.id,
        device_name: 'MacBook Pro'
      }, as: :json

      expect(response).to have_http_status(:ok)
      new_login_response = JSON.parse(response.body)
      new_access_token = new_login_response['access_token']

      # ============================================================================
      # Step 9: Register second user to same account
      # ============================================================================

      clear_enqueued_jobs # Clear previous jobs

      post '/api/v1/auth/register', params: {
        email: 'member@example.com',
        password: 'MemberPass123',
        full_name: 'Team Member',
        account_id: account.id
      }, as: :json

      expect(response).to have_http_status(:created)
      member_registration = JSON.parse(response.body)
      expect(member_registration['user']['email']).to eq('member@example.com')
      expect(member_registration['account']['id']).to eq(account.id)

      # Verify new user was created as member, not owner
      member_user = User.find_by(email: 'member@example.com')
      member_membership = account.memberships.find_by(user: member_user)
      expect(member_membership.role).to eq('member')

      # Verify verification email was enqueued for new user
      expect(enqueued_jobs.size).to eq(1)

      # ============================================================================
      # Step 10: Verify new member can see account users (after verification)
      # ============================================================================

      # First verify the member's email
      member_verification_token = member_user.verification_token
      post '/api/v1/auth/verify-email', params: {
        token: member_verification_token
      }, as: :json
      expect(response).to have_http_status(:ok)

      # Login as member
      post '/api/v1/auth/login', params: {
        email: 'member@example.com',
        password: 'MemberPass123',
        account_id: account.id,
        device_name: 'iPhone'
      }, as: :json

      expect(response).to have_http_status(:ok)
      member_login = JSON.parse(response.body)
      member_access_token = member_login['access_token']

      # ============================================================================
      # Step 11: Test account-level permissions
      # ============================================================================

      # Owner should be able to list account users
      get "/api/v1/accounts/#{account.id}/users", headers: {
        'Authorization' => "Bearer #{new_access_token}"
      }

      expect(response).to have_http_status(:ok)
      users_list = JSON.parse(response.body)
      expect(users_list.length).to eq(2)
      emails = users_list.map { |u| u['email'] }
      expect(emails).to include('owner@example.com', 'member@example.com')

      # Member should NOT be able to list account users (forbidden)
      get "/api/v1/accounts/#{account.id}/users", headers: {
        'Authorization' => "Bearer #{member_access_token}"
      }

      expect(response).to have_http_status(:forbidden)
      forbidden_response = JSON.parse(response.body)
      expect(forbidden_response['message']).to include('Forbidden')

      # ============================================================================
      # Step 12: Test token refresh
      # ============================================================================

      original_refresh_token = member_login['refresh_token']

      post '/api/v1/auth/refresh', params: {
        refresh_token: original_refresh_token,
        account_id: account.id
      }, as: :json

      expect(response).to have_http_status(:ok)
      refresh_response = JSON.parse(response.body)
      expect(refresh_response['access_token']).to be_present
      expect(refresh_response['user']['email']).to eq('member@example.com')

      # New access token should work
      new_member_token = refresh_response['access_token']
      get '/api/v1/users/me', headers: {
        'Authorization' => "Bearer #{new_member_token}"
      }
      expect(response).to have_http_status(:ok)

      # ============================================================================
      # Step 13: Test logout
      # ============================================================================

      post '/api/v1/auth/logout', params: {
        refresh_token: original_refresh_token
      }, as: :json

      expect(response).to have_http_status(:ok)
      logout_response = JSON.parse(response.body)
      expect(logout_response['message']).to include('Logged out successfully')

      # Refresh token should no longer work
      post '/api/v1/auth/refresh', params: {
        refresh_token: original_refresh_token
      }, as: :json

      expect(response).to have_http_status(:unauthorized)

      # ============================================================================
      # Verify final state
      # ============================================================================

      expect(User.count).to eq(2)
      expect(Account.count).to eq(1)
      expect(Membership.count).to eq(2)

      # Verify roles
      owner_membership = account.memberships.joins(:user).where(users: { email: 'owner@example.com' }).first
      member_membership = account.memberships.joins(:user).where(users: { email: 'member@example.com' }).first

      expect(owner_membership.role).to eq('owner')
      expect(member_membership.role).to eq('member')

      # Verify both users are verified
      expect(User.find_by(email: 'owner@example.com').email_verified).to be_truthy
      expect(User.find_by(email: 'member@example.com').email_verified).to be_truthy
    end
  end
end
