import { type Context, type Next } from 'koa'
import { database } from '../database'

export async function connect (ctx: Context, next: Next): Promise<void> {
  ctx.state.database = database
  await next()
}
