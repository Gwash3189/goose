import { X_GOOSE_USER_JWT_KEY_HEADER } from './authenticate'
import * as T from '../../types'
import { z } from 'zod'
import { env } from '../../process'
import { BadRequest } from '../../response'
import { verify } from '../../security/jwt'
import { Context } from 'koa'

export async function security (ctx: Context, next: () => Promise<void>): Promise<void> {
  const headerResult = T.ensure<string>(ctx.get(X_GOOSE_USER_JWT_KEY_HEADER), z.string())

  if (!headerResult.success) {
    throw new BadRequest('Missing token')
  }

  const result = verify(headerResult.data, env.JWT_SECRET)

  if (!result.success) {
    throw new BadRequest('Invalid token')
  }

  const { id, accountId } = result.data

  if (ctx.url.includes(id) && ctx.url.includes(accountId)) {
    return await next()
  } else {
    throw new BadRequest()
  }
}
