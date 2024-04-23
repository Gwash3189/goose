import { Ctx } from '../../types'
import * as Accounts from '../../models/accounts'
import { InternalServerError, UnprocessableEntity } from '../../response'

export async function list (ctx: Ctx): Promise<void> {
  const { id } = ctx.state.owner
  const { page = '0', pageSize = '10' } = ctx.query

  if (Array.isArray(page)) throw new UnprocessableEntity()
  if (Array.isArray(pageSize)) throw new UnprocessableEntity()

  const listResult = await Accounts
    .many(ctx.state.database, {
      ownerId: id,
      page,
      pageSize
    })

  if (!listResult.success) {
    throw new InternalServerError()
  }

  ctx.body = {
    data: listResult.data
  }
}
