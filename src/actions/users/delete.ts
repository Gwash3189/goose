import { Ctx } from '../../types'
import * as Users from '../../models/users'
import { NotFound } from '../../response'
import { type DeleteParams, del as DeleteSchema } from './schemas'
import * as T from '../../types'

export async function del (ctx: Ctx): Promise<void> {
  const paramsResult = T.ensure<DeleteParams>(
    ctx.params,
    DeleteSchema.params
  )

  if (!paramsResult.success) {
    throw new NotFound()
  }

  const { accountId, userId } = paramsResult.data
  const deleteResult = await Users.del(ctx.state.database, { id: userId, accountId })

  if (!deleteResult.success) {
    throw new NotFound()
  }

  ctx.body = {
    data: deleteResult.data
  }
}
