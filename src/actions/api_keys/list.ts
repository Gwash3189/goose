import { Ctx } from '../../types'
import * as ApiKeys from '../../models/api_keys'
import { InternalServerError, UnprocessableEntity } from '../../response'
import { ListParams, list as ListSchema } from './schemas'
import * as T from '../../types'

export async function list (ctx: Ctx): Promise<void> {
  const { state: { database } } = ctx

  const paramsResult = T.ensure<ListParams>(
    ctx.params,
    ListSchema.params
  )

  if (!paramsResult.success) {
    throw new UnprocessableEntity('Missing required route param of accountId or userId')
  }

  const entity = (paramsResult.data.accountId ?? paramsResult.data.userId) as string

  const findResults = await ApiKeys.list(database, { entity })

  if (!findResults.success) {
    throw new InternalServerError('Unable to process request')
  }

  ctx.body = {
    data: findResults.data.map(ApiKeys.serialize)
  }
}
