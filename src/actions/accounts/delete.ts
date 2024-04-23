import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import { NotFound } from '../../response'
import * as T from '../../types'
import { DeleteParams, del as DeleteSchema } from './schemas'

export async function del (ctx: Ctx): Promise<void> {
  const paramsResult = T.ensure<DeleteParams>(ctx.params, DeleteSchema.params)

  if (!paramsResult.success) {
    throw new NotFound()
  }

  const { accountId } = paramsResult.data
  const { id: ownerId } = ctx.state.owner
  const delResult = await Accounts
    .del(ctx.state.database, { id: accountId, ownerId })

  if (!delResult.success) {
    throw new NotFound()
  }

  ctx.body = {
    data: delResult.data
  }
}
