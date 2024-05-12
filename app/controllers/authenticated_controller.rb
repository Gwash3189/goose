class AuthenticatedController < ApplicationController
  before_action :find_entity

  def find_entity
    header = request.headers['Authorization']
    return render json: { error: 'No Authorization header' }, status: :unauthorized unless header

    token = header.split(' ').last
    return render json: { error: 'No token' }, status: :unauthorized unless token
    entity = ApiKey.find_by_key(token)

    return render json: { error: 'Invalid token' }, status: :unauthorized unless entity

    @entity = entity.entity
  end

  def entity
    @entity ||= find_entity
  end
end
