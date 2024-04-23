import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import * as T from '../../types'
import { type CreateBody, update as CreateSchema } from './schemas'
import { UnprocessableEntity } from '../../response'

export async function create (ctx: Ctx): Promise<void> {
  const bodyResult = T.ensure<CreateBody>(ctx.request.body, CreateSchema.body)

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error.errors.join(', ').trim())
  }
  const { name } = bodyResult.data
  const { id: ownerId } = ctx.state.owner
  const createResult = await Accounts.create(ctx.state.database, { name, ownerId })

  if (!createResult.success) {
    throw new UnprocessableEntity()
  }

  ctx.body = {
    data: createResult.data
  }
}
