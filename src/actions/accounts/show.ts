import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import { NotFound } from '../../response'
import * as T from '../../types'
import { ShowParams, show as ShowSchema } from './schemas'

export async function show (ctx: Ctx): Promise<void> {
  const paramsResult = T.ensure<ShowParams>(ctx.params, ShowSchema.params)

  if (!paramsResult.success) {
    throw new NotFound()
  }

  const { accountId } = paramsResult.data
  const { id: ownerId } = ctx.state.owner

  const findResult = await Accounts
    .find(ctx.state.database, { id: accountId, ownerId })

  if (!findResult.success) {
    throw new NotFound()
  }

  ctx.body = {
    data: findResult.data
  }
}
