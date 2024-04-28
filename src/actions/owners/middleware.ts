import { type Next } from 'koa'
import { Ctx } from '../../types'
import { Unauthorized } from '../../response'
import { Cache } from '../../cache'
import { type Owner } from '@prisma/client'
import * as Time from '../../time'
import * as ApiKey from '../../models/api_keys'
import * as Owners from '../../models/owners'

export const GOOSE_API_KEY_HEADER = 'x-goose-owner-api-key'

export async function authenticate (ctx: Ctx, next: Next): Promise<void> {
  const { state: { database } } = ctx
  const apiKey = ctx.get(GOOSE_API_KEY_HEADER)

  if (apiKey === undefined || Array.isArray(apiKey)) {
    throw new Unauthorized('Missing API Key')
  }

  const ownerResult = Cache.get<Owner>(apiKey)

  if (ownerResult.success) {
    ctx.state.owner = ownerResult.data
    ctx.state.key = apiKey
    Cache.set(apiKey, ownerResult.data, { milliseconds: Time.minutes(10) })
    return await next()
  }

  const { id: apiKeyId } = ApiKey.deserialize(apiKey)

  const apiKeyRow = await ApiKey
    .find(database, { id: apiKeyId })

  if (!apiKeyRow.success) {
    throw new Unauthorized('Missing API Key')
  }

  const owner = await Owners
    .find(database, { id: apiKeyRow.data.entity })

  if (!owner.success) {
    throw new Unauthorized('API key does not belong to an owner')
  }

  ctx.state.owner = owner.data

  Cache.set(
    apiKeyId,
    owner.data,
    { milliseconds: Time.minutes(10) }
  )

  return await next()
}
