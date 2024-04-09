import { Ctx } from '../../types'
import * as ApiKeys from '../../models/api_keys'

export async function rotate (ctx: Ctx): Promise<void> {
  const { state: { owner, database } } = ctx

  ctx.body = {
    data: await ApiKeys.rotate(database, { id: owner.id })
  }
}
