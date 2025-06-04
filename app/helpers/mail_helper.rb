# app/helpers/mail_helper.rb
module MailHelper
  def email_image_tag(image, **options)
    attachments[image] = File.read(Rails.root.join("app/assets/images/#{image}"))
    image_tag attachments[image].url, **options
  end

  def format_date(date)
    date.strftime("%B %d, %Y")
  end

  def format_datetime(datetime)
    datetime.strftime("%B %d, %Y at %I:%M %p %Z")
  end
end
