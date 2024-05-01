import { describe, it, beforeEach, expect } from 'vitest'
import { Account, ApiKey, PrismaClient, User } from '@prisma/client'
import { CtxBuilder, Response, getClient } from '../../support'
import * as AccountFactory from '../../../src/database/factories/account'
import * as UserFactory from '../../../src/database/factories/user'
import * as ApiKeyFactory from '../../../src/database/factories/api_key'
import { type Ctx } from '../../../src/types'
import { list } from '../../../src/actions/api_keys/list'
import * as T from '../../../src/types'
import * as ApiKeys from '../../../src/models/api_keys'
import { randomUUID } from 'crypto'
import { UnprocessableEntity } from '../../../src/response'

describe('api_keys/list', () => {
  describe('when the provided request is for an account', () => {
    let prisma: PrismaClient
    let account: Account
    let keys: Array<Awaited<ApiKey>>
    let otherKey: ApiKey
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      account = await AccountFactory.create(prisma)
      otherKey = await ApiKeyFactory.create(prisma, { entity: randomUUID() })
      keys = await Promise.all(new Array(3).fill(null).map(async () => {
        return await ApiKeyFactory.create(prisma, {
          entity: account.id
        })
      }))
      ctx = new CtxBuilder()
        .database(prisma)
        .params({ accountId: account.id })
        .build()

      await list(ctx)
    })

    it('returns all keys owned by the entity', async () => {
      const expected = keys.map(ApiKeys.serialize)

      //@ts-expect-error
      expect(T.cast<Response>(ctx).body.data).to.include(...expected)
    })

    it('does not return keys not owned by the entity', () => {
      expect(T.cast<Response>(ctx).body.data).to.not.include(otherKey)
    })
  })

  describe('when the provided request is for a user', () => {
    let prisma: PrismaClient
    let user: User
    let keys: Array<Awaited<ApiKey>>
    let otherKey: ApiKey
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      otherKey = await ApiKeyFactory.create(prisma, { entity: randomUUID() })
      keys = await Promise.all(new Array(3).fill(null).map(async () => {
        return await ApiKeyFactory.create(prisma, {
          entity: user.id
        })
      }))
      ctx = new CtxBuilder()
        .database(prisma)
        .params({ userId: user.id })
        .build()

      await list(ctx)
    })

    it('returns all keys owned by the entity', async () => {
      const expected = keys.map(ApiKeys.serialize)

      //@ts-expect-error
      expect(T.cast<Response>(ctx).body.data).to.include(...expected)
    })

    it('does not return keys not owned by the entity', () => {
      expect(T.cast<Response>(ctx).body.data).to.not.include(otherKey)
    })
  })

  describe('when the provided entity does not have any api keys', () => {
    let prisma: PrismaClient
    let user: User
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .params({ userId: user.id })
        .build()

      await list(ctx)
    })

    it('returns an empty array', async () => {
      expect(T.cast<Response>(ctx).body.data).to.deep.equal([])
    })
  })

  describe('when the request is invalid', () => {
    let prisma: PrismaClient
    let user: User
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .build()
    })

    it('throws an UnprocessableEntity error', async () => {
      await expect(list(ctx)).rejects.toThrowError(new UnprocessableEntity('Missing required route param of accountId or userId'))
    })
  })
})
