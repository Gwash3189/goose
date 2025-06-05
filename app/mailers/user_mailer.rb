class UserMailer < ApplicationMailer
  # Email verification after registration
  def verification_email(user)
    @user = user
    @verification_url = verify_email_url(token: user.verification_token)

    mail(
      to: user.email,
      subject: "Please verify your email address"
    ) do |format|
      format.html { render "verification_email" }
      format.text { render "verification_email" }
    end
  end

  # Welcome email after verification
  def welcome_email(user)
    @user = user
    @login_url = login_url

    mail(
      to: user.email,
      subject: "Welcome to #{app_name}!"
    )
  end

  # Password reset request
  def reset_password_email(user)
    @user = user
    @reset_url = reset_password_url(token: user.reset_password_token)
    @expires_in = "2 hours"

    mail(
      to: user.email,
      subject: "Password reset instructions"
    )
  end

  # Password changed notification
  def password_changed_email(user)
    @user = user
    @support_email = AppConfig.support_email
    @changed_at = Time.current.strftime("%B %d, %Y at %I:%M %p %Z")

    mail(
      to: user.email,
      subject: "Your password has been changed"
    )
  end

  # Account invitation
  def account_invitation_email(user, account, invited_by)
    @user = user
    @account = account
    @invited_by = invited_by
    @login_url = login_url

    mail(
      to: user.email,
      subject: "You've been invited to join #{account.name}"
    )
  end

  # New device login notification
  def new_device_login_email(user, device_info)
    @user = user
    @device_name = device_info[:device_name]
    @ip_address = device_info[:ip_address]
    @location = device_info[:location] # You'd need to implement IP geolocation
    @login_time = Time.current.strftime("%B %d, %Y at %I:%M %p %Z")
    @support_email = AppConfig.support_email

    mail(
      to: user.email,
      subject: "New login to your account"
    )
  end

  private

  def app_name
    AppConfig.app_name
  end

  def verify_email_url(token:)
    "#{AppConfig.frontend_url}/verify-email?token=#{token}"
  end

  def reset_password_url(token:)
    "#{AppConfig.frontend_url}/reset-password?token=#{token}"
  end

  def login_url
    "#{AppConfig.frontend_url}/login"
  end
end
