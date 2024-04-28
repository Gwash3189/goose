import { Ctx } from '../../types'
import * as Owners from '../../models/owners'
import { ServiceUnavailable } from '../../response'

export async function show (ctx: Ctx): Promise<void> {
  try {
    const result = await Owners.many(ctx.state.database)

    if (!result.success) {
      throw new ServiceUnavailable()
    }

    ctx.body = {
      healthy: result.data.length > 0
    }
  } catch (error) {
    throw new ServiceUnavailable()
  }
}
