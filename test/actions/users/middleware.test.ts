import { describe, it, beforeEach, expect, vi } from 'vitest'
import { PrismaClient, User } from '@prisma/client'
import { CtxBuilder, getClient } from '../../support'
import * as UserFactory from '../../../src/database/factories/user'
import { type Ctx } from '../../../src/types'
import { X_GOOSE_USER_JWT_KEY_HEADER } from '../../../src/actions/users/authenticate'
import { security } from '../../../src/actions/users/middleware'
import jwt from 'jsonwebtoken'
import { env } from '../../../src/process'
import { BadRequest } from '../../../src/response'

describe('users/middleware', () => {
  describe('middleware', () => {
    let user: User
    let prisma: PrismaClient
    let ctx: Ctx
    let next: () => Promise<void>

    beforeEach(async () => {
      next = vi.fn(async () => {})
      prisma = await getClient()
      user = await UserFactory.create(prisma)
      ctx = new CtxBuilder()
        .database(prisma)
        .url(`/accounts/${user.accountId}/users/${user.id}`)
        .headers({ [X_GOOSE_USER_JWT_KEY_HEADER]: jwt.sign({ id: user.id, accountId: user.accountId }, env.JWT_SECRET) })
        .body({
          email: user.email,
          password: 'password'
        })
        .build()
    })

    it('does not throw', async () => {
      await expect(security(ctx, next)).resolves.not.toThrow()
    })

    it('calls next', async () => {
      await security(ctx, next)
      await expect(next).toHaveBeenCalled()
    })

    describe('when given an invalid token', () => {
      beforeEach(async () => {
        next = vi.fn(async () => {})
        prisma = await getClient()
        user = await UserFactory.create(prisma)
        ctx = new CtxBuilder()
          .database(prisma)
          .url(`/accounts/${user.accountId}/users/${user.id}`)
          .headers({ [X_GOOSE_USER_JWT_KEY_HEADER]: jwt.sign({ id: '123', accountId: '321' }, env.JWT_SECRET) })
          .body({
            email: user.email,
            password: 'password'
          })
          .build()
      })

      it('throws', async () => {
        await expect(security(ctx, next)).rejects.toThrow(BadRequest)
        await expect(next).not.toHaveBeenCalled()
      })
    })
  })
})
