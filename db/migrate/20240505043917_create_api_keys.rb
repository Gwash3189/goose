class CreateApiKeys < ActiveRecord::Migration[7.1]
  def change
    create_table :api_keys do |t|
      t.boolean :expired, default: false
      t.datetime :expires_at
      t.string :key
      t.references :entity, polymorphic: true, null: false

      t.timestamps
    end
  end
end
