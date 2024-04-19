import { describe, it, beforeEach, expect } from 'vitest'
import { create } from '../../../src/actions/accounts/create'
import { Owner, Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { CtxBuilder, databaseTimeout, getClient } from '../../support'
import * as OwnerFactory from '../../../src/database/factories/owner'
import { BadRequest } from '../../../src/response'

describe('Accounts.create', () => {
  let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  let owner: Owner

  beforeEach(async () => {
    prisma = await getClient()
    owner = await OwnerFactory.create(prisma)
  }, databaseTimeout)

  describe('when given a valid name', () => {
    beforeEach(async () => {
      await create(
        new CtxBuilder()
          .owner(owner)
          .database(prisma)
          .body({ name: 'test' })
          .build()
      )
    })

    it('should create an account', async () => {
      expect(await prisma.account.findFirst({
        where: {
          name: 'test'
        }
      })).to.not.eq(null)
    })
  })

  describe('when given an valid name', () => {
    it('should not create an account', async () => {
      await expect(async () => await create(
        new CtxBuilder()
          .owner(owner)
          .database(prisma)
          .body({ name: undefined })
          .build()
      )).rejects.toThrow(BadRequest)
    })
  })
})
