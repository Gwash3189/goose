import { Ctx } from '../../types'
import * as Users from '../../models/users'

export async function list (ctx: Ctx): Promise<void> {
  const { accountId } = ctx.params
  const { page = '0', pageSize = '10' } = ctx.query

  ctx.body = {
    data: await Users
      .many(ctx.state.database, {
        accountId,
        page: page as string,
        pageSize: pageSize as string
      })
  }
}
