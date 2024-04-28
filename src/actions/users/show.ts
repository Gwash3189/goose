import { Ctx } from '../../types'
import * as Users from '../../models/users'
import { NotFound } from '../../response'
import { type ShowParams, show as ShowSchema } from './schemas'
import * as T from '../../types'

export async function show (ctx: Ctx): Promise<void> {
  const paramsResult = T.ensure<ShowParams>(
    ctx.params,
    ShowSchema.params
  )

  if (!paramsResult.success) {
    throw new NotFound()
  }

  const { userId, accountId } = paramsResult.data

  const showResult = await Users
    .find(ctx.state.database, { id: userId, accountId })

  if (!showResult.success) {
    throw new NotFound()
  }

  try {
    ctx.body = {
      data: showResult.data
    }
  } catch (error) {
    throw new NotFound()
  }
}
