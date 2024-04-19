import { describe, it, beforeEach, expect } from 'vitest'
import { update } from '../../../src/actions/accounts/update'
import { Account, Owner, Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { CtxBuilder, databaseTimeout, getClient } from '../../support'
import * as OwnerFactory from '../../../src/database/factories/owner'
import * as AccountFactory from '../../../src/database/factories/account'
import { BadRequest } from '../../../src/response'

describe('Accounts.update', () => {
  let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  let owner: Owner
  let account: Account

  beforeEach(async () => {
    prisma = await getClient()
    owner = await OwnerFactory.create(prisma)
    account = await AccountFactory.create(prisma, { ownerId: owner.id })
  }, databaseTimeout)

  describe('when given a valid name', () => {
    beforeEach(async () => {
      await update(
        new CtxBuilder()
          .owner(owner)
          .params({ accountId: account.id })
          .database(prisma)
          .body({ name: 'updated name' })
          .build()
      )
    })

    it('update the account', async () => {
      expect(await prisma.account.findMany({
        where: {
          name: 'updated name'
        }
      })).to.have.length(1)
    })
  })

  describe('when given an invalid name', () => {
    it('does not create an account', async () => {
      await expect(async () => await update(
        new CtxBuilder()
          .owner(owner)
          .params({ accountId: account.id })
          .database(prisma)
          .body({ name: '' })
          .build()
      )).rejects.toThrow(BadRequest)
    })
  })
})
