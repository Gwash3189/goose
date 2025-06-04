class ApplicationMailer < ActionMailer::Base
  default from: ENV.fetch('DEFAULT_FROM_EMAIL', 'noreply@yourapp.com')
  layout 'mailer'

  helper :application

  # Include host helpers for URL generation
  include Rails.application.routes.url_helpers

  protected

  def default_url_options
    { host: ENV.fetch('APP_HOST', 'localhost:3000') }
  end
end
