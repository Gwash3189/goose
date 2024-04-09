import { Ctx } from '../../types'
import * as Users from '../../models/users'
import { NotFound } from '../../response'

export async function show (ctx: Ctx): Promise<void> {
  const { accountId, userId } = ctx.params

  try {
    ctx.body = {
      data: await Users.find(ctx.state.database, { id: userId, accountId })
    }
  } catch (error) {
    throw new NotFound()
  }
}
