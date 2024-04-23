import { describe, it, beforeEach, expect } from 'vitest'
import { PrismaClient, User } from '@prisma/client'
import { CtxBuilder, getClient, type Response } from '../../support'
import * as UserFactory from '../../../src/database/factories/user'
import * as T from '../../../src/types'
import { type Ctx } from '../../../src/types'
import { show } from '../../../src/actions/users/show'
import { NotFound } from '../../../src/response'
import { randomUUID } from 'crypto'

describe('users/show', () => {
  describe('when the provided request is valid', () => {
    let prisma: PrismaClient
    let user: User
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          accountId: user.accountId,
          userId: user.id
        })
        .build()

      await show(ctx)
    })

    it('returns the requested user', () => {
      delete (user as any).password
      expect(T.cast<Response>(ctx).body.data).to.deep.equal(user)
    })
  })

  describe('when the provided request is has an invalid params', () => {
    let prisma: PrismaClient
    let user: User
    let ctx: Ctx

    describe('when the provided accountId is invalid', () => {
      beforeEach(async () => {
        prisma = await getClient()
        user = await UserFactory.create(prisma)
        ctx = new CtxBuilder()
          .database(prisma)
          .params({
            accountId: '123',
            userId: user.id
          })
          .build()
      })

      it('throws a not found error', async () => {
        await expect(show(ctx)).rejects.toThrow(NotFound)
      })
    })

    describe('when the provided userId is invalid', () => {
      beforeEach(async () => {
        prisma = await getClient()
        user = await UserFactory.create(prisma)
        ctx = new CtxBuilder()
          .database(prisma)
          .params({
            accountId: user.accountId,
            userId: '123'
          })
          .build()
      })

      it('throws a not found error', async () => {
        await expect(show(ctx)).rejects.toThrow(NotFound)
      })
    })

    describe('when the provided user UUID don\'t exist in out system', () => {
      beforeEach(async () => {
        prisma = await getClient()
        ctx = new CtxBuilder()
          .database(prisma)
          .params({
            accountId: user.accountId,
            userId: randomUUID()
          })
          .build()
      })

      it('throws a not found error', async () => {
        await expect(show(ctx)).rejects.toThrow(NotFound)
      })
    })

    describe('when the provided account UUID don\'t exist in out system', () => {
      beforeEach(async () => {
        prisma = await getClient()
        ctx = new CtxBuilder()
          .database(prisma)
          .params({
            accountId: randomUUID(),
            userId: user.id
          })
          .build()
      })

      it('throws a not found error', async () => {
        await expect(show(ctx)).rejects.toThrow(NotFound)
      })
    })
  })
})
