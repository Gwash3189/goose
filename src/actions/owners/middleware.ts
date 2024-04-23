import { type Next } from 'koa'
import { Ctx } from '../../types'
import { Unauthorized } from '../../response'
import { Cache } from '../../cache'
import { type Owner } from '@prisma/client'
import * as Time from '../../time'

export const GOOSE_API_KEY_HEADER = 'x-goose-api-key'

export async function authenticate (ctx: Ctx, next: Next): Promise<void> {
  const { state: { database } } = ctx
  const apiKey = ctx.get(GOOSE_API_KEY_HEADER)

  if (apiKey === undefined || Array.isArray(apiKey)) {
    throw new Unauthorized('Missing API Key')
  }

  const ownerResult = Cache.get<Owner>(apiKey)

  if (ownerResult.success) {
    ctx.state.owner = ownerResult.data
    Cache.set(apiKey, ownerResult.data, { milliseconds: Time.minutes(10) })
    return await next()
  }

  const apiKeyRow = await database.apiKey.findFirst({
    where: {
      key: apiKey
    },
    select: {
      entity: true
    }
  })

  if (apiKeyRow === null) {
    throw new Unauthorized('Missing API Key')
  }

  const owner = await database.owner.findUnique({
    where: {
      id: apiKeyRow.entity
    }
  })

  if (owner === null) {
    throw new Unauthorized('Missing API Key')
  }

  ctx.state.owner = owner
  Cache.set(apiKey, owner, { milliseconds: Time.minutes(10) })

  return await next()
}
