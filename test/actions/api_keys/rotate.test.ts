import { describe, it, beforeEach, expect } from 'vitest'
import { Account, ApiKey, PrismaClient } from '@prisma/client'
import { CtxBuilder, Response, getClient } from '../../support'
import * as AccountFactory from '../../../src/database/factories/account'
import * as ApiKeyFactory from '../../../src/database/factories/api_key'
import { type Ctx } from '../../../src/types'
import { rotate } from '../../../src/actions/api_keys/rotate'
import * as ApiKeys from '../../../src/models/api_keys'
import * as T from '../../../src/types'

describe('api_keys/rotate', () => {
  describe('when the provided request is valid', () => {
    let prisma: PrismaClient
    let account: Account
    let keyRecord: ApiKey
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      account = await AccountFactory.create(prisma)
      keyRecord = await ApiKeyFactory.create(prisma, {
        entity: account.id
      })
      ctx = new CtxBuilder()
        .database(prisma)
        .body({
          key: ApiKeys.serialize(keyRecord)
        })
        .build()

      await rotate(ctx)
    })

    it('rotates the api key', async () => {
      const apiKeyRecord = await prisma.apiKey.findUnique({ where: { id: keyRecord.id } })

      expect(T.cast<Response>(ctx).body.data.key).to.not.deep.equal(ApiKeys.serialize(keyRecord))
      expect(T.cast<Response>(ctx).body.data.key).to.deep.equal(ApiKeys.serialize(apiKeyRecord as ApiKey))
    })
  })
})
