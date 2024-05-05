class CreateAccounts < ActiveRecord::Migration[7.1]
  def change
    create_table :accounts do |t|
      t.string :name, null: false
      t.references :customer, null: false, foreign_key: true

      t.timestamps
    end

    add_index :accounts, :name, unique: true
  end
end
