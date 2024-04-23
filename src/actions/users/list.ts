import { Ctx } from '../../types'
import * as Users from '../../models/users'
import { ListParams, list as ListSchema } from './schemas'
import * as T from '../../types'
import { InternalServerError, NotFound } from '../../response'

export async function list (ctx: Ctx): Promise<void> {
  const paramsResult = T.ensure<ListParams>(
    ctx.params,
    ListSchema.params
  )

  if (!paramsResult.success) {
    throw new NotFound()
  }

  const { accountId } = paramsResult.data
  const { page = '0', pageSize = '10' } = ctx.query

  const usersResult = await Users
    .many(ctx.state.database, {
      accountId,
      page: page as string,
      pageSize: pageSize as string
    })

  if (!usersResult.success) {
    throw new InternalServerError()
  }

  ctx.body = {
    data: usersResult.data
  }
}
