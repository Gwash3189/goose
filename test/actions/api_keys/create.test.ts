import { describe, it, beforeEach, expect } from 'vitest'
import { Account, Owner, PrismaClient } from '@prisma/client'
import { CtxBuilder, getClient, type Response } from '../../support'
import * as AccountFactory from '../../../src/database/factories/account'
import * as OwnerFactory from '../../../src/database/factories/owner'
import * as T from '../../../src/types'
import { type Ctx } from '../../../src/types'
import { create } from '../../../src/actions/api_keys/create'
import { UnprocessableEntity } from '../../../src/response'
import { FromNow } from '../../../src/time'

describe('api_keys/create', () => {
  describe('when the provided request is valid', () => {
    let prisma: PrismaClient
    let account: Account
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      account = await AccountFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          entityId: account.id
        })
        .body({
          expiresAt: new Date().toISOString()
        })
        .build()

      await create(ctx)
    })

    it('sends back an api key', () => {
      expect(T.cast<Response>(ctx).body.data.key).to.be.a('string')
    })

    it('sends back a seralized api key', () => {
      const [id, key] = T.cast<Response>(ctx).body.data.key.split('::')

      expect(id).to.be.a('string')
      expect(key).to.be.a('string')
    })

    it('creates a key assigned to that entity', async () => {
      const apiKey = await prisma.apiKey.findUnique({
        where: {
          id: T.cast<Response>(ctx).body.data.key.split('::')[0]
        }
      })

      expect(apiKey).to.not.equal(null)
      expect(apiKey?.entity).to.equal(account.id)
    })
  })

  describe('when the provided body is invalid', () => {
    let prisma: PrismaClient
    let account: Account
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      account = await AccountFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          entityId: account.id
        })
        .body({
          expiresAt: '123'
        })
        .build()
    })

    it('throws an UnprocessableEntity error', async () => {
      await expect(create(ctx))
        .rejects.toThrowError(new UnprocessableEntity('Invalid datetime'))
    })
  })

  describe('when the provided entity is an owner', () => {
    let prisma: PrismaClient
    let owner: Owner
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      owner = await OwnerFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          entityId: owner.id
        })
        .body({
          expiresAt: FromNow.years(1).toISOString()
        })
        .build()
    })

    it('throws an UnprocessableEntity error', async () => {
      await expect(create(ctx))
        .rejects.toThrowError(new UnprocessableEntity('Can not make an API key for an owner'))
    })
  })

  describe('when the provided params are invalid', () => {
    let prisma: PrismaClient
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          entityId: '123'
        })
        .body({
          expiresAt: new Date().toISOString()
        })
        .build()
    })

    it('throws an UnprocessableEntity error', async () => {
      await expect(create(ctx))
        .rejects.toThrowError(new UnprocessableEntity('Invalid uuid'))
    })
  })
})
