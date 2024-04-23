import { type Next } from 'koa'
import { Ctx } from '../../types'
import { Unauthorized } from '../../response'
import { Cache } from '../../cache'
import { type Owner } from '@prisma/client'

const GOOSE_API_KEY_HEADER = 'x-goose-api-key'

export async function authenticate (ctx: Ctx, next: Next): Promise<void> {
  const { request, state: { database } } = ctx
  const { headers } = request
  const apiKey = headers[GOOSE_API_KEY_HEADER]

  if (apiKey === undefined && Array.isArray(apiKey)) {
    throw new Unauthorized('Missing API Key')
  }

  const ownerResult = Cache.get<Owner>(apiKey as string)

  if (ownerResult.success) {
    ctx.state.owner = ownerResult.data
    return await next()
  }

  const assignment = await database.apiKey.findFirst({
    where: {
      key: apiKey as string
    },
    select: {
      apiKeyAssignment: {
        select: {
          entity: true
        }
      }
    }
  })

  if (assignment === null) {
    throw new Unauthorized('Missing API Key')
  }

  const owner = await database.owner.findUnique({
    where: {
      id: assignment.apiKeyAssignment?.entity
    }
  })

  if (owner === null) {
    throw new Unauthorized('Missing API Key')
  }

  ctx.state.owner = owner
  Cache.set(apiKey as string, owner, { seconds: 600 })
  return await next()
}
