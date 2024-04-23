import { Ctx } from '../../types'
import * as Users from '../../models/users'
import * as T from '../../types'
import { type UpdateBody, type UpdateParams, update as UpdateSchemas } from './schemas'
import { NotFound, UnprocessableEntity } from '../../response'

export async function update (ctx: Ctx): Promise<void> {
  const paramsResults = T.ensure<UpdateParams>(
    ctx.params,
    UpdateSchemas.params
  )

  if (!paramsResults.success) {
    throw new UnprocessableEntity(paramsResults.error.errors.join(', ').trim())
  }

  const bodyResult = T.ensure<UpdateBody>(
    ctx.request.body,
    UpdateSchemas.body
  )

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error.errors.join(', ').trim())
  }

  const { accountId, userId: id } = paramsResults.data
  const { email, name, password } = bodyResult.data
  const updateResult = await Users
    .update(ctx.state.database, {
      accountId,
      id,
      email,
      name,
      password
    })

  if (!updateResult.success) {
    throw new NotFound()
  }

  ctx.body = {
    data: updateResult.data
  }
}
