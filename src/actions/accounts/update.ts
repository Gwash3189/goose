import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import { NotFound, UnprocessableEntity } from '../../response'
import * as T from '../../types'
import { type UpdateParams, type UpdateBody, update as UpdateSchemas } from './schemas'

export async function update (ctx: Ctx): Promise<void> {
  const bodyResult = T.ensure<UpdateBody>(ctx.request.body, UpdateSchemas.body)

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error.errors.join(', ').trim())
  }

  const paramsResult = T.ensure<UpdateParams>(ctx.params, UpdateSchemas.params)

  if (!paramsResult.success) {
    throw new UnprocessableEntity(paramsResult.error.errors.join(', ').trim())
  }

  const { id: ownerId } = ctx.state.owner
  const { accountId } = paramsResult.data
  const { name } = bodyResult.data

  const accountResult = await Accounts
    .update(
      ctx.state.database,
      { ownerId, name, id: accountId }
    )

  if (!accountResult.success) {
    throw new NotFound()
  }

  ctx.body = {
    data: accountResult.data
  }
}
