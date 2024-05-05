class ApiKeysController < ApplicationController
  before_action :set_api_key, only: %i[ show update destroy ]

  # GET /:customer_id/api_keys
  def index
    @api_keys = Customer.find(params[:customer_id]).api_keys

    render json: @api_keys
  end

  # GET /:customer_id/api_keys/1
  def show
    render json: @api_key
  end

  # POST /:customer_id/api_keys
  def create
    customer = Customer.find(params[:customer_id])

    @api_key = ApiKey.new(api_key_params
      .merge({
        entity: customer,
        key: ApiKey.create_key[:key]
      })
    )

    if @api_key.save
      render json: @api_key, status: :created, location: customer_api_key_url(customer, @api_key)
    else
      render json: @api_key.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /:customer_id/api_keys/1
  def update
    if @api_key.update(api_key_params)
      render json: @api_key
    else
      render json: @api_key.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /:customer_id/api_keys/:id/rotate
  def rotate
    if @api_key.update({
      expired: true,
      expires_at: 1.second.ago
    })

      customer = Customer.find(params[:customer_id])

      return render json: { error: 'Customer not found' }, status: :not_found if customer.nil?

      new_api_key = ApiKey.create(rotate_api_key_params)

      render json: @api_key, location: customer_api_key_url(customer, new_api_key)
    else
      render json: @api_key.errors, status: :unprocessable_entity
    end
  end

  # DELETE /:customer_id/api_keys/1
  def destroy
    @api_key.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_api_key
      @api_key = ApiKey.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def api_key_params
      params.require(:api_key).permit(:expired, :expires_at)
    end

    def rotate_api_key_params
      params.require(:api_key).permit(:expires_at)
    end
end
