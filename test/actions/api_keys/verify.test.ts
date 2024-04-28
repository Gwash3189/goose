import { describe, it, beforeEach, expect } from 'vitest'
import { Account, ApiKey, PrismaClient } from '@prisma/client'
import { CtxBuilder, Response, getClient } from '../../support'
import * as AccountFactory from '../../../src/database/factories/account'
import * as ApiKeyFactory from '../../../src/database/factories/api_key'
import { type Ctx } from '../../../src/types'
import { verify } from '../../../src/actions/api_keys/verify'
import * as ApiKeys from '../../../src/models/api_keys'
import * as T from '../../../src/types'
import { NotFound } from '../../../src/response'

describe('api_keys/verify', () => {
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

      await verify(ctx)
    })

    it('returns true', async () => {
      expect(T.cast<Response>(ctx).body.data.result).to.equal(true)
    })
  })

  describe('when the provided request is invalid', () => {
    let prisma: PrismaClient
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      ctx = new CtxBuilder()
        .database(prisma)
        .body({
          key: '123::321'
        })
        .build()
    })

    it('throws a not found error', async () => {
      await expect(verify(ctx)).rejects.toThrowError(new NotFound('API key not found'))
    })
  })
})