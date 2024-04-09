import { describe, it, beforeEach, expect } from 'vitest'
import { del } from '../../../src/actions/accounts/delete'
import { Account, Owner, Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { CtxBuilder, databaseTimeout, getClient } from '../../support'
import * as OwnerFactory from '../../../src/database/factories/owner'
import * as AccountFactory from '../../../src/database/factories/account'
import { NotFound } from '../../../src/response'

describe('Accounts.update', () => {
  let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  let owner: Owner
  let account: Account

  beforeEach(async () => {
    prisma = await getClient()
    owner = await OwnerFactory.create(prisma)
    account = await AccountFactory.create(prisma, { ownerId: owner.id })
  }, databaseTimeout)

  describe('when given an existing account id', () => {
    beforeEach(async () => {
      await del(
        new CtxBuilder()
          .owner(owner)
          .params({ accountId: account.id })
          .database(prisma)
          .build()
      )
    })

    it('deletes the account', async () => {
      expect(await prisma.account.findMany({
        where: {
          id: account.id
        }
      })).to.have.length(0)
    })
  })

  describe('when given an account id that doesn\'t exist', () => {
    it('throws a not found error', async () => {
      await expect(async () => {
        await del(
          new CtxBuilder()
            .owner(owner)
            .params({ accountId: '123' })
            .database(prisma)
            .build()
        )
      }).rejects.toThrow(NotFound)
    })
  })
})
