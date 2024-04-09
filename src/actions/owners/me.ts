import { Ctx } from '../../types'

export async function me (ctx: Ctx): Promise<void> {
  const { state: { owner } } = ctx

  ctx.body = {
    data: owner
  }
}
