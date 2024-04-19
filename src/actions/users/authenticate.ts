import { Ctx } from '../../types'
import * as Users from '../../models/users'
import * as T from '../../types'
import bcrypt from 'bcryptjs'
import { type AuthenticateBody, authenticate as AuthenticateSchemas } from './schemas'
import { User } from '@prisma/client'
import jwt from 'jsonwebtoken'
import { env } from '../../process'

export const X_GOOSE_USER_JWT_KEY_HEADER = 'x-goose-user-jwt-key'

export async function authenticate (ctx: Ctx): Promise<void> {
  const { email, password } = T.ensure<AuthenticateBody>(
    ctx.request.body,
    AuthenticateSchemas.body
  )

  const user = await T.success([email, password], async () => {
    try {
      return await Users.byEmail(ctx.state.database, { email })
    } catch (error) {
      return null
    }
  })

  const match = await T.success<typeof user, boolean>(user, async (user) => {
    try {
      return await bcrypt.compare(password, user.password)
    } catch (error) {
      return false
    }
  })

  await T.success<[boolean, User]>([match, user], async ([_match, user]) => {
    const token = jwt.sign(
      { id: user.id, accountId: user.accountId },
      env.JWT_SECRET,
      { expiresIn: '1h' }
    )
    ctx.set(X_GOOSE_USER_JWT_KEY_HEADER, token)
    ctx.body = {
      data: {
        match
      }
    }
  })

  await T.failure([user, match], async () => {
    if (user === null || !match) {
      ctx.body = {
        data: {
          match: false
        }
      }
    }
  })
}
