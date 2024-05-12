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

key = ApiKey.create(
  entity: customer,
  expired: false,
  expires_at: 1.year.from_now,
  key: ApiKey.hash_raw_key("31c12fef-fb41-469e-9506-d44fc9601976")
)

puts "API Key 31c12fef-fb41-469e-9506-d44fc9601976 created for customer: #{customer.id}"

1.times do
  Account.create(
    name: 'Goose Account',
    customer:
  )

  k = ApiKey.create(
    entity: customer,
    expired: false,
    expires_at: 1.year.from_now,
    key: ApiKey.hash_raw_key("9a8a2fb0-f472-4335-9da6-1ef978388577")
  )

  puts "API Key 9a8a2fb0-f472-4335-9da6-1ef978388577 created for account: #{Account.first.id}"
end


5.times do
  Account.create(
    name: Faker::Company.name,
    customer:
  )
end

acc = Account.where(name: 'Goose Account').first

1.times do
  u = User.create(
    name: Faker::Name.name,
    email: Faker::Internet.email,
    password: ApiKey.hash_raw_key('password'),
    account: acc
  )

  k = ApiKey.create(
    entity: customer,
    expired: false,
    expires_at: 1.year.from_now,
    key: ApiKey.hash_raw_key("f9444875-bedf-4c96-be14-6a772aa8e5f7")
  )

  puts "API Key f9444875-bedf-4c96-be14-6a772aa8e5f7 created for user: #{u.id}"
end

10.times do
  u = User.create(
    name: Faker::Name.name,
    email: Faker::Internet.email,
    password: ApiKey.hash_raw_key('password'),
    account: acc
  )
  k = ApiKey.create(
    entity: u
  )
end
