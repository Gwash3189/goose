# app/serializers/user_serializer.rb
class UserSerializer
  def initialize(user, options = {})
    @user = user
    @options = options
  end

  def as_json
    {
      id: @user.id,
      email: @user.email,
      full_name: @user.full_name,
      email_verified: @user.email_verified,
      created_at: @user.created_at,
      last_sign_in_at: @user.last_sign_in_at
    }.tap do |json|
      if @options[:include_accounts]
        json[:accounts] = @user.accounts.active.map do |account|
          {
            id: account.id,
            name: account.name,
            role: membership_role(@user, account)
          }
        end
      end
    end
  end

  private

  def membership_role(user, account)
    user.memberships.find_by(account: account)&.role
  end
end
