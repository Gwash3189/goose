import { describe, it, beforeEach, expect } from 'vitest'
import { PrismaClient, User } from '@prisma/client'
import { CtxBuilder, getClient, type Response } from '../../support'
import * as UserFactory from '../../../src/database/factories/user'
import * as T from '../../../src/types'
import { type Ctx } from '../../../src/types'
import { list } from '../../../src/actions/users/list'
import { NotFound } from '../../../src/response'
import { randomUUID } from 'crypto'

describe('users/list', () => {
  describe('when the provided accountId is valid', () => {
    let user: User
    let prisma: PrismaClient
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          accountId: user.accountId
        })
        .build()

      await list(ctx)
    })

    it('returns the users for that account', () => {
      delete (user as any).password
      expect(T.cast<Response>(ctx).body.data).to.deep.equal([user])
    })
  })

  describe('when the provided accountId is invalid', () => {
    let prisma: PrismaClient
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          accountId: '123'
        })
        .build()
    })

    it('throws a not found error', async () => {
      await expect(list(ctx)).rejects.toThrow(NotFound)
    })
  })

  describe('when the provided accountId is a UUID not in our system', () => {
    let prisma: PrismaClient
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          accountId: randomUUID()
        })
        .build()

      await list(ctx)
    })

    it('returns an empty array', async () => {
      await expect(T.cast<Response>(ctx).body.data).to.have.length(0)
    })
  })
})
