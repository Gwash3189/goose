import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import * as T from '../../types'
import { type CreateBody, update as CreateSchema } from './schemas'
import { UnprocessableEntity } from '../../response'

export async function create (ctx: Ctx): Promise<void> {
  const { name } = T.ensure<CreateBody>(ctx.request.body, CreateSchema.body)
  const { id: ownerId } = ctx.state.owner

  const result = T.all([
    [CreateSchema.name, name]
  ])

  await T.success(result, async () => {
    ctx.body = {
      data: await Accounts.create(ctx.state.database, { ownerId, name })
    }
  })

  await T.failure(result, async (result) => {
    throw new UnprocessableEntity(result.error.errors.join(', ').trim())
  })
}
