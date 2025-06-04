class CreateUsersAccountsTable < ActiveRecord::Migration[8.0]
  def change
    create_table :accounts do |t|
      t.string :name, null: false
      t.string :subdomain, index: { unique: true }
      t.boolean :active, default: true
      t.json :settings, default: {}

      t.timestamps
    end
  end
end
