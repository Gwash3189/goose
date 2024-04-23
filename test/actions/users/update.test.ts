import { describe, it, beforeEach, expect } from 'vitest'
import { PrismaClient, User } from '@prisma/client'
import { CtxBuilder, getClient, type Response } from '../../support'
import * as UserFactory from '../../../src/database/factories/user'
import * as T from '../../../src/types'
import { type Ctx } from '../../../src/types'
import { update } from '../../../src/actions/users/update'
import { NotFound, UnprocessableEntity } from '../../../src/response'
import { randomUUID } from 'crypto'
import { faker } from '@faker-js/faker'

describe('users/update', () => {
  let prisma: PrismaClient
  let user: User
  let ctx: Ctx
  let body: Record<string, string>

  describe('when the provided request is valid', () => {
    beforeEach(async () => {
      prisma = await getClient()
      body = {
        email: faker.internet.email(),
        name: faker.person.firstName(),
        password: faker.internet.password()
      }
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .body(body)
        .params({
          accountId: user.accountId,
          userId: user.id
        })
        .build()

      await update(ctx)
    })

    it('returns the requested user with updated values', () => {
      delete (user as any).password
      expect(T.cast<Response>(ctx).body.data).to.have.property('email', body.email)
      expect(T.cast<Response>(ctx).body.data).to.have.property('name', body.name)
    })

    it('does not update other properties', () => {
      delete (user as any).password
      expect(T.cast<Response>(ctx).body.data).to.have.property('id', user.id)
    })
  })

  describe('when the provided request is has an invalid params', () => {
    describe('when the provided accountId is invalid', () => {
      beforeEach(async () => {
        prisma = await getClient()
        body = {
          email: faker.internet.email(),
          name: faker.person.firstName(),
          password: faker.internet.password()
        }
        user = await UserFactory.create(prisma)
        ctx = new CtxBuilder()
          .database(prisma)
          .params({
            accountId: '123',
            userId: user.id
          })
          .build()
      })

      it('throws an unprocessable entity error', async () => {
        await expect(update(ctx)).rejects.toThrow(UnprocessableEntity)
      })
    })

    describe('when the provided userId is invalid', () => {
      beforeEach(async () => {
        prisma = await getClient()
        body = {
          email: faker.internet.email(),
          name: faker.person.firstName(),
          password: faker.internet.password()
        }
        user = await UserFactory.create(prisma)
        ctx = new CtxBuilder()
          .database(prisma)
          .params({
            accountId: user.accountId,
            userId: '123'
          })
          .build()
      })

      it('throws an unprocessable entity error', async () => {
        await expect(update(ctx)).rejects.toThrow(UnprocessableEntity)
      })
    })

    describe('when the provided user UUID don\'t exist in out system', () => {
      beforeEach(async () => {
        prisma = await getClient()
        body = {
          email: faker.internet.email(),
          name: faker.person.firstName(),
          password: faker.internet.password()
        }
        ctx = new CtxBuilder()
          .database(prisma)
          .body(body)
          .params({
            accountId: user.accountId,
            userId: randomUUID()
          })
          .build()
      })

      it('throws an unprocessable entity error', async () => {
        await expect(update(ctx)).rejects.toThrow(NotFound)
      })
    })

    describe('when the provided account UUID don\'t exist in out system', () => {
      beforeEach(async () => {
        prisma = await getClient()
        body = {
          email: faker.internet.email(),
          name: faker.person.firstName(),
          password: faker.internet.password()
        }
        ctx = new CtxBuilder()
          .database(prisma)
          .body(body)
          .params({
            accountId: randomUUID(),
            userId: user.id
          })
          .build()
      })

      it('throws an unprocessable entity error', async () => {
        await expect(update(ctx)).rejects.toThrow(NotFound)
      })
    })
  })
})
