import { describe, it, beforeEach, vi, expect } from 'vitest'
import { authenticate, GOOSE_API_KEY_HEADER } from '../../../src/actions/owners/middleware'
import { ApiKey, Owner, PrismaClient } from '@prisma/client'
import { Ctx, Success } from '../../../src/types'
import * as OwnerFactory from '../../../src/database/factories/owner'
import * as ApiKeyFactory from '../../../src/database/factories/api_key'
import { CtxBuilder, getClient } from '../../support'
import { Next } from 'koa'
import { Cache } from '../../../src/cache'
import { randomUUID } from 'crypto'
import { minutes } from '../../../src/time'
import { afterEach } from 'node:test'
import { Unauthorized } from '../../../src/response'
import * as ApiKeys from '../../../src/models/api_keys'

describe('Owners.authenticate middleware', () => {
  describe('when given a valid API key', () => {
    let prisma: PrismaClient
    let owner: Owner
    let apiKey: ApiKey
    let next: Next
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      next = vi.fn()
      owner = await OwnerFactory.create(prisma)
      apiKey = await ApiKeyFactory.create(prisma, { entity: owner.id })
      ctx = new CtxBuilder()
        .database(prisma)
        .headers({ [GOOSE_API_KEY_HEADER]: ApiKeys.serialize(apiKey) })
        .build()

      await authenticate(ctx, next)
    })

    afterEach(() => {
      Cache.clear()
    })

    it('authenticates the owner', async () => {
      expect(next).toHaveBeenCalled()
    })

    it('sets the owner in the cache via the api key', async () => {
      expect((Cache.get(apiKey.id) as Success<Owner>).data).to.deep.equal(owner)
    })
  })

  describe('when the owner is already in the cache', () => {
    let prisma: PrismaClient
    let owner: Owner
    let apiKey: ApiKey
    let next: Next
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      next = vi.fn()
      owner = await OwnerFactory.create(prisma)
      apiKey = await ApiKeyFactory.create(prisma, { entity: owner.id })
      Cache.set(apiKey.key, owner, { milliseconds: minutes(10) })
      ctx = new CtxBuilder()
        .database(prisma)
        .headers({ [GOOSE_API_KEY_HEADER]: apiKey.key })
        .build()

      await authenticate(ctx, next)
    })

    afterEach(() => {
      Cache.clear()
    })

    it('authenticates the owner', async () => {
      expect(next).toHaveBeenCalled()
    })

    it('sets the owner in the cache via the api key', async () => {
      expect((Cache.get(apiKey.key) as Success<Owner>).data).to.deep.equal(owner)
    })
  })

  describe('when given an api key that isn\'t in our system', () => {
    let prisma: PrismaClient
    let next: Next
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      next = vi.fn()
      ctx = new CtxBuilder()
        .database(prisma)
        .headers({ [GOOSE_API_KEY_HEADER]: randomUUID() })
        .build()
    })

    afterEach(() => {
      Cache.clear()
    })

    it('throws an Unauthorized error', async () => {
      await expect(authenticate(ctx, next)).rejects.toThrow(Unauthorized)
    })

    it('doesn\'t call next', async () => {
      await expect(next).not.toHaveBeenCalled()
    })
  })

  describe('when the owner can\'t be found via the provided api key', () => {
    let prisma: PrismaClient
    let apiKey: ApiKey
    let next: Next
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      next = vi.fn()
      apiKey = await ApiKeyFactory.create(prisma, { entity: randomUUID() })
      ctx = new CtxBuilder()
        .database(prisma)
        .headers({ [GOOSE_API_KEY_HEADER]: apiKey.key })
        .build()
    })

    afterEach(() => {
      Cache.clear()
    })

    it('throws an Unauthorized error', async () => {
      await expect(authenticate(ctx, next)).rejects.toThrow(Unauthorized)
    })

    it('doesn\'t call next', async () => {
      await expect(next).not.toHaveBeenCalled()
    })
  })

  describe('when given the api key is missing from the header', () => {
    let prisma: PrismaClient
    let next: Next
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      next = vi.fn()
      ctx = new CtxBuilder()
        .database(prisma)
        .build()
    })

    afterEach(() => {
      Cache.clear()
    })

    it('throws an Unauthorized error', async () => {
      await expect(authenticate(ctx, next)).rejects.toThrow(Unauthorized)
    })

    it('doesn\'t call next', async () => {
      await expect(next).not.toHaveBeenCalled()
    })
  })
})
