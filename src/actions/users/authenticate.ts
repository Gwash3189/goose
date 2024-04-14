import { Ctx } from '../../types'
import * as Users from '../../models/users'
import * as T from '../../types'
import bcrypt from 'bcryptjs'
import { type AuthenticateBody, authenticate as AuthenticateSchemas } from './schemas'
import { UnprocessableEntity } from '../../response'
import { User } from '@prisma/client'
import { SafeParseError } from 'zod'

export async function authenticate (ctx: Ctx): Promise<void> {
  const { email, password } = T.ensure<AuthenticateBody>(
    ctx.request.body,
    AuthenticateSchemas.body
  )

  const result = T.all([
    [AuthenticateSchemas.email, email],
    [AuthenticateSchemas.password, password]
  ])

  const user = await T.success<typeof result, User>(result, async () => {
    return await Users.by(ctx.state.database, { email }, true) as User
  })

  const match = await T.success<typeof user, boolean>(user, async (user) => {
    return await bcrypt.compare(password, user.password)
  })

  await T.success(match, async () => {
    ctx.body = {
      data: {
        match
      }
    }
  })

  await T.failure([result, user, match], async () => {
    if (result !== true && !(result?.success)) {
      throw new UnprocessableEntity('Whoops')
    }

    if (user === undefined || match === false) {
      ctx.body = {
        data: {
          match: false
        }
      }
    }
  })
}
