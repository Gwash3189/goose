class AddPasswordChangedAtToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :password_changed_at, :datetime
  end
end
