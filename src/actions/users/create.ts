import { Ctx } from '../../types'
import * as Users from '../../models/users'
import * as T from '../../types'
import { type CreateBody, type CreateParams, create as CreateSchemas } from './schemas'
import { UnprocessableEntity } from '../../response'

export async function create (ctx: Ctx): Promise<void> {
  const paramsResult = T.ensure<CreateParams>(
    ctx.params,
    CreateSchemas.params
  )

  if (!paramsResult.success) {
    throw new UnprocessableEntity(paramsResult.error.errors[0].message)
  }

  const bodyResult = T.ensure<CreateBody>(
    ctx.request.body,
    CreateSchemas.body
  )

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error.errors[0].message)
  }

  const { email, name, password } = bodyResult.data
  const { accountId } = paramsResult.data
  const userResult = await Users
    .create(ctx.state.database, {
      accountId,
      email,
      name,
      password
    })

  if (!userResult.success) {
    throw new UnprocessableEntity(userResult.error.message)
  }

  ctx.body = {
    data: userResult.data
  }
}
