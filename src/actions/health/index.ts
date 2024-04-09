import { Ctx } from '../../types'
import * as Owners from '../../models/owners'
import { ServiceUnavailable } from '../../response'

export async function show (ctx: Ctx): Promise<void> {
  try {
    ctx.body = {
      healthy: await Owners.many(ctx.state.database).then(() => true)
    }
  } catch (error) {
    throw new ServiceUnavailable()
  }
}
