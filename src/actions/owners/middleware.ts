import { type Next } from 'koa'
import { Ctx } from '../../types'
import { Unauthorized } from '../../response'

const GOOSE_API_KEY_HEADER = 'x-goose-api-key'

export async function authenticate (ctx: Ctx, next: Next): Promise<void> {
  const { request, state: { database } } = ctx
  const { headers } = request
  const apiKey = headers[GOOSE_API_KEY_HEADER]

  if (apiKey === undefined) {
    throw new Unauthorized('Missing API Key')
  }

  const owner = await database.owner.findFirst({
    where: {
      apiKeys: {
        some: {
          key: apiKey as string
        }
      }
    }
  })

  if (owner === null) {
    throw new Unauthorized('Missing API Key')
  }

  ctx.state.owner = owner

  return await next()
}
