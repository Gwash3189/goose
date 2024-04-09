import { Ctx } from '../../types'
import * as Users from '../../models/users'
import * as T from '../../types'
import { type UpdateBody, type UpdateParams, update as UpdateSchemas } from './schemas'
import { UnprocessableEntity } from '../../response'

export async function update (ctx: Ctx): Promise<void> {
  const { accountId, userId: id } = T.ensure<UpdateParams>(
    ctx.params,
    UpdateSchemas.params
  )

  const { name, email, password } = T.ensure<UpdateBody>(
    ctx.request.body,
    UpdateSchemas.body
  )

  const result = T.all([
    [UpdateSchemas.name, name],
    [UpdateSchemas.email, email],
    [UpdateSchemas.password, password]
  ])

  await T.success(result, async () => {
    ctx.body = {
      data: await Users
        .update(ctx.state.database, {
          accountId,
          id,
          email,
          name,
          password
        })
    }
  })

  await T.failure(result, async (result) => {
    throw new UnprocessableEntity(result.error.errors.join(', ').trim())
  })
}
