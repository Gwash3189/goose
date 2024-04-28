import { Ctx } from '../../types'
import * as ApiKeys from '../../models/api_keys'
import * as T from '../../types'
import { type CreateParams, type CreateBody, create as CreateSchemas } from './schemas'
import { UnprocessableEntity } from '../../response'

export async function create (ctx: Ctx): Promise<void> {
  const paramsResult = T.ensure<CreateParams>(
    ctx.params,
    CreateSchemas.params
  )

  if (!paramsResult.success) {
    throw new UnprocessableEntity(paramsResult.error)
  }

  const bodyResult = T.ensure<CreateBody>(
    ctx.request.body,
    CreateSchemas.body
  )

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error)
  }

  const { expiresAt } = bodyResult.data
  const { entityId } = paramsResult.data

  const entity = await ApiKeys.entity(ctx.state.database, { entityId })

  if (!entity.success) {
    throw new UnprocessableEntity('Entity not found')
  }

  if (entity.data.type === 'owner') {
    throw new UnprocessableEntity('Can not make an API key for an owner')
  }

  const apiKeyResult = await ApiKeys.create(
    ctx.state.database,
    {
      entity: entityId,
      expiresAt: expiresAt !== undefined ? new Date(expiresAt) : undefined
    }
  )

  if (!apiKeyResult.success) {
    throw new UnprocessableEntity(apiKeyResult.error.message)
  }

  ctx.body = {
    data: {
      key: ApiKeys.serialize(apiKeyResult.data)
    }
  }
}
