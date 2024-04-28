import { Ctx } from '../../types'
import * as ApiKeys from '../../models/api_keys'
import { InternalServerError, UnprocessableEntity } from '../../response'
import { RotateBody, rotate as RotateSchemas } from './schemas'
import * as T from '../../types'

export async function rotate (ctx: Ctx): Promise<void> {
  const { state: { database } } = ctx

  const bodyResult = T.ensure<RotateBody>(
    ctx.request.body,
    RotateSchemas.body
  )

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error)
  }

  const { id } = ApiKeys.deserialize(bodyResult.data.key)

  const rotationResult = await ApiKeys.rotate(database, { id })

  if (!rotationResult.success) {
    throw new InternalServerError(rotationResult.error.message)
  }

  ctx.body = {
    data: {
      key: ApiKeys.serialize(rotationResult.data)
    }
  }
}
