class AddIndexToApiKeys < ActiveRecord::Migration[7.1]
  def change
    add_index :api_keys, :key, unique: true
  end
end
