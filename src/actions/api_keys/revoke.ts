import { Ctx } from '../../types'
import * as ApiKeys from '../../models/api_keys'
import { NotFound, UnprocessableEntity } from '../../response'
import { RevokeBody, revoke as RevokeSchema } from './schemas'
import * as T from '../../types'

export async function revoke (ctx: Ctx): Promise<void> {
  const { state: { database } } = ctx

  const bodyResult = T.ensure<RevokeBody>(
    ctx.request.body,
    RevokeSchema.body
  )

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error)
  }

  const { id } = ApiKeys.deserialize(bodyResult.data.key)

  const deleteResults = await ApiKeys.del(database, { id })

  if (!deleteResults.success) {
    throw new NotFound('API key not found')
  }

  ctx.body = {
    data: deleteResults.data
  }
}
