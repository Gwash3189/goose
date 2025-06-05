class ApplicationMailer < ActionMailer::Base
  default from: AppConfig.default_from_email
  layout "mailer"

  # Include host helpers for URL generation
  include Rails.application.routes.url_helpers

  protected

  def default_url_options
    { host: AppConfig.app_host }
  end
end
