import { describe, it, beforeEach, expect } from 'vitest'
import { PrismaClient, User } from '@prisma/client'
import { CtxBuilder, getClient } from '../../support'
import * as UserFactory from '../../../src/database/factories/user'
import { Ctx } from '../../../src/types'
import { authenticate } from '../../../src/actions/users/authenticate'

describe('users/authenticate', () => {
  describe('when given a valid password', () => {
    let user: User
    let prisma: PrismaClient
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .body({
          email: user.email,
          password: 'password'
        })
        .build()

      await authenticate(ctx)
    })

    it('returns true', () => {
      expect(ctx.body.data.match).to.eq(true)
    })
  })

  describe('when given a invalid password', () => {
    let user: User
    let prisma: PrismaClient
    let ctx: Ctx

    beforeEach(async () => {
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .body({
          email: user.email,
          password: 'notpassword'
        })
        .build()

      await authenticate(ctx)
    })

    it('returns false', () => {
      expect(ctx.body.data.match).to.eq(false)
    })
  })
})