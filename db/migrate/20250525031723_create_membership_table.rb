class CreateMembershipTable < ActiveRecord::Migration[8.0]
  def change
    create_table :memberships do |t|
      t.references :account, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.integer :role, null: false, default: 0
      t.boolean :active, default: true

      t.timestamps
    end

    add_index :memberships, [ :account_id, :user_id ], unique: true
    add_index :memberships, :role
  end
end
