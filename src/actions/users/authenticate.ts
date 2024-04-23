import { Ctx } from '../../types'
import * as Users from '../../models/users'
import * as T from '../../types'
import { type AuthenticateBody, authenticate as AuthenticateSchemas } from './schemas'
import { sign } from '../../security/jwt'
import { env } from '../../process'
import { NotFound } from '../../response'
import { compare } from '../../security/hash'

export const X_GOOSE_USER_JWT_KEY_HEADER = 'x-goose-user-jwt-key'

export async function authenticate (ctx: Ctx): Promise<void> {
  const bodyResult = T.ensure<AuthenticateBody>(
    ctx.request.body,
    AuthenticateSchemas.body
  )

  if (!bodyResult.success) {
    throw new NotFound()
  }

  const { email, password } = bodyResult.data

  const user = await Users.byEmail(ctx.state.database, { email })

  if (!user.success) {
    throw new NotFound()
  }

  const match = await compare(password, user.data.password)

  if (!match.success) {
    ctx.status = 401
    ctx.body = {
      data: {
        authenticated: false
      }
    }
    return
  }

  const token = sign(
    { id: user.data.id, accountId: user.data.accountId },
    env.JWT_SECRET,
    { expiresIn: '1h' }
  )

  if (!token.success) {
    throw new NotFound()
  }

  ctx.set(X_GOOSE_USER_JWT_KEY_HEADER, token.data)
  ctx.body = {
    data: {
      authenticated: true
    }
  }
}
