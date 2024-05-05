class AccountsController < ApplicationController
  before_action :set_account, only: %i[ show update destroy ]

  # GET /:customer_id/accounts
  def index
    @accounts = Account.where(customer_id: params[:customer_id]).all

    render json: @accounts
  end

  # GET /:customer_id/accounts/1
  def show
    render json: @account
  end

  # POST /:customer_id/accounts
  def create
    @account = Account.new(account_params)

    if @account.save
      render json: @account, status: :created, location: @account
    else
      render json: @account.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /:customer_id/accounts/1
  def update
    if @account.update(account_params)
      render json: @account
    else
      render json: @account.errors, status: :unprocessable_entity
    end
  end

  # DELETE /:customer_id/accounts/1
  def destroy
    @account.destroy!
  end

  private
    # Use callbacks to share common setup or constraints between actions.
    def set_account
      @account = Account.find(params[:id])
    end

    # Only allow a list of trusted parameters through.
    def account_params
      params.require(:account).permit(:name, :customer_id)
    end
end
