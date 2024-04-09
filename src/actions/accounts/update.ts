import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import { UnprocessableEntity } from '../../response'
import * as T from '../../types'
import { type UpdateParams, type UpdateBody, update as UpdateSchemas } from './schemas'

export async function update (ctx: Ctx): Promise<void> {
  const { name } = T.ensure<UpdateBody>(ctx.request.body, UpdateSchemas.body)
  const { accountId } = T.ensure<UpdateParams>(ctx.params, UpdateSchemas.params)
  const { id: ownerId } = ctx.state.owner

  const result = T.all([
    [UpdateSchemas.name, name]
  ])

  await T.success(result, async () => {
    ctx.body = {
      data: await Accounts.update(ctx.state.database, { ownerId, name, id: accountId })
    }
  })

  await T.failure(result, async (result) => {
    throw new UnprocessableEntity(result.error.errors.join(', ').trim())
  })
}
