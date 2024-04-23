import { describe, it, beforeEach, expect } from 'vitest'
import { list } from '../../../src/actions/accounts/list'
import { Account, Owner, Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { CtxBuilder, databaseTimeout, getClient, Response } from '../../support'
import * as OwnerFactory from '../../../src/database/factories/owner'
import * as AccountFactory from '../../../src/database/factories/account'
import { UnprocessableEntity } from '../../../src/response'
import { type Ctx } from '../../../src/types'
import * as T from '../../../src/types'

describe('Accounts.list', () => {
  let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  let owner: Owner
  let account: Account
  let ctx: Ctx

  beforeEach(async () => {
    prisma = await getClient()
    owner = await OwnerFactory.create(prisma)
    account = await AccountFactory.create(prisma, { ownerId: owner.id })
  }, databaseTimeout)

  describe('when given a valid account id', () => {
    beforeEach(async () => {
      ctx = new CtxBuilder()
        .owner(owner)
        .params({ accountId: account.id })
        .database(prisma)
        .body({ name: 'updated name' })
        .build()

      await list(ctx)
    })

    it('lists all the accounts', async () => {
      expect(T.cast<Response>(ctx).body.data).to.deep.include(account)
    })
  })

  describe('pagination', () => {
    describe('when given a page and pageSize', () => {
      beforeEach(async () => {
        account = await AccountFactory.create(prisma, { ownerId: owner.id })
        ctx = new CtxBuilder()
          .owner(owner)
          .params({ accountId: account.id })
          .database(prisma)
          .query({ page: '1', pageSize: '1' })
          .build()

        await list(ctx)
      })

      it('lists the correct number of accounts', async () => {
        expect(T.cast<Response>(ctx).body.data).to.have.length(1)
      })
    })

    describe('when given an invalid page', () => {
      it('lists the correct number of accounts', async () => {
        await expect(async () => await list(new CtxBuilder()
          .owner(owner)
          .params({ accountId: account.id })
          .database(prisma)
          .query({ page: ['1'], pageSize: '1' })
          .build())
        ).rejects.toThrow(UnprocessableEntity)
      })
    })

    describe('when given an invalid pageSize', () => {
      it('lists the correct number of accounts', async () => {
        await expect(async () => await list(new CtxBuilder()
          .owner(owner)
          .params({ accountId: account.id })
          .database(prisma)
          .query({ page: '1', pageSize: ['1'] })
          .build())
        ).rejects.toThrow(UnprocessableEntity)
      })
    })
  })
})
