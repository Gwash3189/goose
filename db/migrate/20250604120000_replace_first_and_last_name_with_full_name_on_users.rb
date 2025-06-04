class ReplaceFirstAndLastNameWithFullNameOnUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :full_name, :string, null: false, default: ''
    reversible do |dir|
      dir.up do
        User.reset_column_information if defined?(User)
        User.find_each do |user|
          user.update_columns(full_name: [ user.try(:first_name), user.try(:last_name) ].compact.join(' ').strip)
        end
      end
    end
    remove_column :users, :first_name, :string
    remove_column :users, :last_name, :string
  end
end
