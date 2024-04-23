import { describe, it, beforeEach, expect } from 'vitest'
import { show } from '../../../src/actions/accounts/show'
import { Account, Owner, Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { CtxBuilder, getClient, Response } from '../../support'
import * as OwnerFactory from '../../../src/database/factories/owner'
import * as AccountFactory from '../../../src/database/factories/account'
import { type Ctx } from '../../../src/types'
import * as T from '../../../src/types'
import { randomUUID } from 'crypto'
import { NotFound } from '../../../src/response'

describe('Accounts.show', () => {
  let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  let owner: Owner
  let account: Account
  let ctx: Ctx

  beforeEach(async () => {
    prisma = await getClient()
    owner = await OwnerFactory.create(prisma)
    account = await AccountFactory.create(prisma, { ownerId: owner.id })
  })

  describe('when given a valid account id', () => {
    beforeEach(async () => {
      ctx = new CtxBuilder()
        .owner(owner)
        .params({ accountId: account.id })
        .database(prisma)
        .build()

      await show(ctx)
    })

    it('shows the specific account', async () => {
      expect(T.cast<Response>(ctx).body.data).to.deep.equal(account)
    })
  })

  describe('when given a UUID that isn\'t in our system', () => {
    beforeEach(async () => {
      ctx = new CtxBuilder()
        .owner(owner)
        .params({ accountId: randomUUID() })
        .database(prisma)
        .build()
    })

    it('throws a NotFound error', async () => {
      await expect(show(ctx)).rejects.toThrow(NotFound)
    })
  })

  describe('when given an invalid UUID', () => {
    beforeEach(async () => {
      ctx = new CtxBuilder()
        .owner(owner)
        .params({ accountId: '123' })
        .database(prisma)
        .build()
    })

    it('throws a NotFound error', async () => {
      await expect(show(ctx)).rejects.toThrow(NotFound)
    })
  })
})
