import { describe, expect, it, beforeEach, vi } from 'vitest'
import { show } from '../../../src/actions/health'
import { Ctx } from '../../../src/types'
import { ServiceUnavailable } from '../../../src/response'
import { CtxBuilder, getClient } from '../../support'
import { Prisma, PrismaClient } from '@prisma/client'
import { DefaultArgs } from '@prisma/client/runtime/library'
import * as OwnerFactory from '../../../src/database/factories/owner'

describe('health', () => {
  let prisma: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
  let ctx: Ctx

  beforeEach(async () => {
    prisma = await getClient()
  })

  describe('when the database can be reached', () => {
    beforeEach(async () => {
      await OwnerFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .build()
      await show(ctx)
    })

    it('should return healthy', async () => {
      expect(ctx.body.data).to.deep.equal({ healthy: true })
    })
  })

  describe('when the database can\'t be reached', () => {
    beforeEach(() => {
      const mockedPrisma = {
        ...prisma,
        owner: {
          ...prisma.owner,
          findMany: vi.fn(() => {
            throw new Error('Database is down')
          })
        }
      }

      ctx = new CtxBuilder()
        .database(mockedPrisma as unknown as typeof prisma)
        .build()
    })

    it('should throw a service unavailable error', async () => {
      await expect(async () => await show(ctx)).rejects.toThrow(ServiceUnavailable)
    })
  })
})
