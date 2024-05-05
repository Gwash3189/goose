require 'rails_helper'

# This spec was generated by rspec-rails when you ran the scaffold generator.
# It demonstrates how one might use RSpec to test the controller code that
# was generated by Rails when you ran the scaffold generator.
#
# It assumes that the implementation code is generated by the rails scaffold
# generator. If you are using any extension libraries to generate different
# controller code, this generated spec may or may not pass.
#
# It only uses APIs available in rails and/or rspec-rails. There are a number
# of tools you can use to make these specs even more expressive, but we're
# sticking to rails and rspec-rails APIs to keep things simple and stable.

RSpec.describe "/api_keys", type: :request do
  # This should return the minimal set of attributes required to create a valid
  # ApiKey. As you add validations to ApiKey, be sure to
  # adjust the attributes here as well.
  let(:customer) { Customer.create(name: 'Goose', email: 'goose@goose.com') }
  let(:valid_attributes) {
    {
      entity: customer,
      key: ApiKey.create_key[:key],
      expired: false,
      expires_at: 1.year.from_now
    }
  }

  let(:invalid_attributes) {
    {
      expires_at: nil,
    }
  }

  # This should return the minimal set of values that should be in the headers
  # in order to pass any filters (e.g. authentication) defined in
  # ApiKeysController, or in your router and rack
  # middleware. Be sure to keep this updated too.
  let(:valid_headers) {
    {}
  }

  describe "GET /index" do
    it "renders a successful response" do
      ApiKey.create! valid_attributes
      get customer_api_keys_url(customer), headers: valid_headers, as: :json
      expect(response).to be_successful
    end
  end

  describe "GET /show" do
    it "renders a successful response" do
      api_key = ApiKey.create! valid_attributes
      get customer_api_key_url(customer, api_key), as: :json
      expect(response).to be_successful
    end
  end

  describe "POST /create" do
    context "with valid parameters" do
      it "creates a new ApiKey" do
        expect {
          post customer_api_keys_url(customer),
               params: { api_key: valid_attributes }, headers: valid_headers, as: :json
        }.to change(ApiKey, :count).by(1)
      end

      it "renders a JSON response with the new api_key" do
        post customer_api_keys_url(customer),
             params: { api_key: valid_attributes }, headers: valid_headers, as: :json
        expect(response).to have_http_status(:created)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end

    context "with invalid parameters" do
      it "does not create a new ApiKey" do
        expect {
          post customer_api_keys_url(customer),
               params: { api_key: invalid_attributes }, as: :json
        }.to change(ApiKey, :count).by(0)
      end

      it "renders a JSON response with errors for the new api_key" do
        post customer_api_keys_url(customer),
             params: { api_key: invalid_attributes }, headers: valid_headers, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end
  end

  describe "PATCH /update" do
    context "with valid parameters" do
      let(:date) { 2.years.from_now }
      let(:new_attributes) {
        {
          **valid_attributes,
          expires_at: Time.zone.now + 2.years
        }
      }

      it "updates the requested api_key" do
        api_key = ApiKey.create! valid_attributes
        patch customer_api_key_url(customer, api_key),
              params: { api_key: new_attributes }, headers: valid_headers, as: :json
        api_key.reload
        expect(api_key.expires_at.in_time_zone).to_not eq(valid_attributes.dig(:expires_at).in_time_zone)
      end

      it "renders a JSON response with the api_key" do
        api_key = ApiKey.create! valid_attributes
        patch customer_api_key_url(customer, api_key),
              params: { api_key: new_attributes }, headers: valid_headers, as: :json
        expect(response).to have_http_status(:ok)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end

    context "with invalid parameters" do
      it "renders a JSON response with errors for the api_key" do
        api_key = ApiKey.create! valid_attributes
        patch customer_api_key_url(customer, api_key),
              params: { api_key: invalid_attributes }, headers: valid_headers, as: :json
        expect(response).to have_http_status(:unprocessable_entity)
        expect(response.content_type).to match(a_string_including("application/json"))
      end
    end
  end

  describe "DELETE /destroy" do
    it "destroys the requested api_key" do
      api_key = ApiKey.create! valid_attributes
      expect {
        delete customer_api_key_url(customer, api_key), headers: valid_headers, as: :json
      }.to change(ApiKey, :count).by(-1)
    end
  end
end
