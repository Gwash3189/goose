# == Schema Information
#
# Table name: api_keys
#
#  id          :integer          not null, primary key
#  entity_type :string           not null
#  expired     :boolean          default(FALSE)
#  expires_at  :datetime
#  key         :string
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  entity_id   :integer          not null
#
# Indexes
#
#  index_api_keys_on_entity  (entity_type,entity_id)
#  index_api_keys_on_key     (key) UNIQUE
#
require 'rails_helper'

RSpec.describe ApiKey, type: :model do
  pending "add some examples to (or delete) #{__FILE__}"
end
