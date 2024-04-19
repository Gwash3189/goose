import { describe, it, beforeEach, expect } from 'vitest'
import { PrismaClient, User } from '@prisma/client'
import { CtxBuilder, getClient, type ResponseBody } from '../../support'
import * as UserFactory from '../../../src/database/factories/user'
import * as T from '../../../src/types'
import { type Ctx } from '../../../src/types'
import { X_GOOSE_USER_JWT_KEY_HEADER, authenticate } from '../../../src/actions/users/authenticate'

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
      expect(T.cast<ResponseBody>(ctx).body.data.match).to.eq(true)
    })

    it(`sets ${X_GOOSE_USER_JWT_KEY_HEADER}`, () => {
      expect(ctx.headers[X_GOOSE_USER_JWT_KEY_HEADER]).to.be.a('string')
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
      expect(T.cast<ResponseBody>(ctx).body.data.match).to.eq(false)
    })
  })
})
