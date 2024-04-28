import { describe, it, beforeEach, expect } from 'vitest'
import { Account, PrismaClient } from '@prisma/client'
import { CtxBuilder, getClient, type Response } from '../../support'
import * as AccountFactory from '../../../src/database/factories/account'
import * as T from '../../../src/types'
import { type Ctx } from '../../../src/types'
import { create } from '../../../src/actions/users/create'
import { faker } from '@faker-js/faker'
import { UnprocessableEntity } from '../../../src/response'

describe('users/create', () => {
  describe('when the provided request is valid', () => {
    let prisma: PrismaClient
    let account: Account
    let ctx: Ctx
    let params: Record<string, string>

    beforeEach(async () => {
      prisma = await getClient()
      account = await AccountFactory.create(prisma)
      params = {
        email: faker.internet.email(),
        name: faker.person.firstName(),
        password: faker.internet.password()
      }
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          accountId: account.id

        })
        .body(params)
        .build()

      await create(ctx)
    })

    it('creates a new user', () => {
      expect(T.cast<Response>(ctx).body.data)
        .to.have.property('email', params.email)

      expect(T.cast<Response>(ctx).body.data)
        .to.have.property('name', params.name)

      expect(T.cast<Response>(ctx).body.data)
        .to.not.have.property('password')
    })
  })

  describe('when the provided request is invalid', () => {
    let prisma: PrismaClient
    let account: Account
    let ctx: Ctx
    let params: Record<string, string>

    beforeEach(async () => {
      prisma = await getClient()
      account = await AccountFactory.create(prisma)
      params = {
        email: faker.internet.email(),
        password: faker.internet.password()
      }
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          accountId: account.id
        })
        .body(params)
        .build()
    })

    it('throws an UnprocessableEntity error', async () => {
      await expect(create(ctx)).rejects.toThrow(UnprocessableEntity)
    })
  })

  describe('when the provided accountId is invalid', () => {
    let prisma: PrismaClient
    let ctx: Ctx
    let params: Record<string, string>

    beforeEach(async () => {
      prisma = await getClient()
      params = {
        email: faker.internet.email(),
        password: faker.internet.password()
      }
      ctx = new CtxBuilder()
        .database(prisma)
        .params({
          accountId: '123'
        })
        .body(params)
        .build()
    })

    it('throws an UnprocessableEntity error', async () => {
      await expect(create(ctx)).rejects.toThrow(new UnprocessableEntity('Invalid uuid'))
    })
  })
})
