# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end


customer = Customer.create(
  name: 'Goose',
  email: 'goose@development.com'
)

key = ApiKey.generate(entity: customer)

1.times do
  Account.create(
    name: 'Goose Account',
    customer:
  )

  k = ApiKey.generate(entity: Account.first)
  puts "API Key #{k[:raw_key]} created for account: #{Account.first.id}"
end

10.times do
  puts "Creating account for customer: #{customer.id}"
  Account.create(
    name: Faker::Company.name,
    customer:
  )
end

acc = Account.where(name: 'Goose Account').first

puts "Creating users for account: #{acc.id}"
100.times do
  u = User.create(
    name: Faker::Name.name,
    email: Faker::Internet.email,
    password: BCrypt::Password.create('password'),
    account: acc
  )
  k = ApiKey.generate(entity: u)
  puts "API Key #{k[:raw_key]} created for user: #{u.id}"
end

puts "API Key #{key[:raw_key]} created for customer: #{customer.id}"
