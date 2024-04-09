import { Ctx } from '../../types'
import * as Users from '../../models/users'
import * as T from '../../types'
import { type CreateBody, type CreateParams, create as CreateSchemas } from './schemas'
import { UnprocessableEntity } from '../../response'

export async function create (ctx: Ctx): Promise<void> {
  const { accountId, userId: id } = T.ensure<CreateParams>(
    ctx.params,
    CreateSchemas.params
  )
  const { name, email, password } = T.ensure<CreateBody>(
    ctx.request.body,
    CreateSchemas.body
  )

  const result = T.all([
    [CreateSchemas.name, name],
    [CreateSchemas.email, email],
    [CreateSchemas.password, password]
  ])

  await T.success(result, async () => {
    ctx.body = {
      data: await Users
        .create(ctx.state.database, {
          accountId,
          email,
          id,
          name,
          password
        })
    }
  })

  await T.failure(result, async (result) => {
    throw new UnprocessableEntity(result.error.errors.join(', ').trim())
  })
}
