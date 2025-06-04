class CreateUsersTable < ActiveRecord::Migration[8.0]
  def change
    create_table :users do |t|
      t.string :email, null: false
      t.string :password_digest, null: false
      t.string :first_name
      t.string :last_name
      t.boolean :email_verified, default: false
      t.datetime :email_verified_at
      t.string :verification_token
      t.datetime :verification_sent_at
      t.string :reset_password_token
      t.datetime :reset_password_sent_at
      t.datetime :last_sign_in_at
      t.string :last_sign_in_ip
      t.integer :sign_in_count, default: 0

      t.timestamps
    end

    add_index :users, :email, unique: true
    add_index :users, :verification_token, unique: true
    add_index :users, :reset_password_token, unique: true
  end
end
