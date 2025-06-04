require 'rails_helper'

RSpec.describe Api::V1::UsersController, type: :controller do
  let(:user) { create(:user, password: 'password123', full_name: 'Test User') }
  let(:account) { create(:account) }
  let!(:membership) { create(:membership, user: user, account: account, role: :owner) }

  before do
    allow(controller).to receive(:authenticate_user!).and_return(true)
    allow(controller).to receive(:current_user).and_return(user)
  end

  describe 'GET #me' do
    it 'returns the current user profile with accounts' do
      get :me, as: :json
      expect(response).to have_http_status(:ok)
      expect(JSON.parse(response.body)['email']).to eq(user.email)
      expect(JSON.parse(response.body)['full_name']).to eq(user.full_name)
      expect(JSON.parse(response.body)['accounts'].first['id']).to eq(account.id)
    end
  end

  describe 'PATCH #update' do
    context 'with valid params' do
      it 'updates the user and returns the updated user' do
        patch :update, params: { user: { full_name: 'New Name' } }, as: :json
        expect(response).to have_http_status(:ok)
        expect(user.reload.full_name).to eq('New Name')
      end
    end

    context 'with invalid params' do
      it 'returns errors and does not update' do
        patch :update, params: { user: { full_name: '' } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']).to be_present
      end
    end
  end

  describe 'PATCH #update_password' do
    context 'with correct current password and valid new password' do
      it 'updates the password' do
        patch :update_password, params: { user: { current_password: 'password123', new_password: 'newpassword456' } }, as: :json
        expect(response).to have_http_status(:ok)
        expect(JSON.parse(response.body)['message']).to include('Password updated successfully')
        expect(user.reload.authenticate('newpassword456')).to eq(user)
      end
    end

    context 'with incorrect current password' do
      it 'returns an error' do
        patch :update_password, params: { user: { current_password: 'wrong', new_password: 'newpassword456' } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']).to include('Current password is incorrect')
      end
    end

    context 'with invalid new password' do
      it 'returns validation errors' do
        patch :update_password, params: { user: { current_password: 'password123', new_password: 'short' } }, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(JSON.parse(response.body)['errors']).to be_present
      end
    end
  end

  describe 'GET #index' do
    let(:admin_user) { create(:user) }
    let!(:admin_membership) { create(:membership, user: admin_user, account: account, role: :admin) }
    let(:member_user) { create(:user) }
    let!(:member_membership) { create(:membership, user: member_user, account: account, role: :member) }

    context 'as owner' do
      before { allow(controller).to receive(:current_user).and_return(user) }
      it 'lists all users for the account' do
        get :index, params: { account_id: account.id }, as: :json
        expect(response).to have_http_status(:ok)
        emails = JSON.parse(response.body).map { |u| u['email'] }
        expect(emails).to include(user.email, admin_user.email, member_user.email)
      end
    end

    context 'as admin' do
      before { allow(controller).to receive(:current_user).and_return(admin_user) }
      it 'lists all users for the account' do
        get :index, params: { account_id: account.id }, as: :json
        expect(response).to have_http_status(:ok)
        emails = JSON.parse(response.body).map { |u| u['email'] }
        expect(emails).to include(user.email, admin_user.email, member_user.email)
      end
    end

    context 'as member' do
      before { allow(controller).to receive(:current_user).and_return(member_user) }
      it 'returns forbidden' do
        get :index, params: { account_id: account.id }, as: :json
        expect(response).to have_http_status(:forbidden)
        expect(JSON.parse(response.body)['errors']).to include('Forbidden')
      end
    end

    context 'when account does not exist' do
      it 'returns not found' do
        get :index, params: { account_id: 999999 }, as: :json
        expect(response).to have_http_status(:not_found)
        expect(JSON.parse(response.body)['errors']).to include('Account not found')
      end
    end
  end
end
