class RemoveSubdomainAndSettingsFromAccounts < ActiveRecord::Migration[8.0]
  def change
    remove_index :accounts, :subdomain if index_exists?(:accounts, :subdomain)
    remove_column :accounts, :subdomain, :string
    remove_column :accounts, :settings, :json
  end
end
