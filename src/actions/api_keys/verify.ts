import { Ctx } from '../../types'
import * as ApiKeys from '../../models/api_keys'
import { NotFound, UnprocessableEntity } from '../../response'
import { VerifyBody, verify as VerifySchema } from './schemas'
import * as T from '../../types'

export async function verify (ctx: Ctx): Promise<void> {
  const { state: { database } } = ctx

  const bodyResult = T.ensure<VerifyBody>(
    ctx.request.body,
    VerifySchema.body
  )

  if (!bodyResult.success) {
    throw new UnprocessableEntity(bodyResult.error)
  }

  const { id } = ApiKeys.deserialize(bodyResult.data.key)

  const findResults = await ApiKeys.find(database, { id })

  if (!findResults.success) {
    throw new NotFound(findResults.error.message)
  }

  ctx.body = {
    data: {
      result: true
    }
  }
}
