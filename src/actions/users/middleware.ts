import { Ctx } from '../../types'
import { X_GOOSE_USER_JWT_KEY_HEADER } from './authenticate'
import * as T from '../../types'
import { z } from 'zod'
import jwt from 'jsonwebtoken'
import { env } from '../../process'
import { BadRequest } from '../../response'

export async function security (ctx: Ctx, next: () => Promise<void>): Promise<void> {
  const token = T.ensure<string>(ctx.get(X_GOOSE_USER_JWT_KEY_HEADER), z.string())

  try {
    const result = jwt.verify(token, env.JWT_SECRET) as { id: string, accountId: string }

    if (ctx.url.includes(result.id) && ctx.url.includes(result.accountId)) {
      return await next()
    }

    throw new BadRequest()
  } catch (error) {
    throw new BadRequest('Invalid token')
  }
}
