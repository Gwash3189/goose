import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import { NotFound } from '../../response'

export async function show (ctx: Ctx): Promise<void> {
  const { accountId } = ctx.params
  const { id: ownerId } = ctx.state.owner

  try {
    ctx.body = {
      data: await Accounts.find(ctx.state.database, { id: accountId, ownerId })
    }
  } catch (error) {
    throw new NotFound()
  }
}
