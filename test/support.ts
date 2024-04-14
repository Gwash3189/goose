import { env } from 'process'
import { $ } from 'execa'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { Prisma, PrismaClient } from '@prisma/client'
import { Ctx } from '../src/types'

const clients: Map<number, PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>> = new Map()

export function getClient (): PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> {
  if (clients.size === 0) {
    throw new Error('Client not initialized')
  }

  return clients.get(parseInt(env.VITEST_WORKER_ID?.toString() as string, 10)) as PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
}

export async function createTestDatabase (): Promise<void> {
  const id = parseInt(env.VITEST_WORKER_ID?.toString() as string, 10)
  env.DATABASE_URL = `file:${id}.db?mode=memory&cache=shared`
  clients.set(id, new PrismaClient())
  await $`prisma db push --skip-generate --force-reset --accept-data-loss`
}

export const databaseTimeout = 10_000

export async function tearDownDatabase (client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>): Promise<void> {
  const id = parseInt(env.VITEST_WORKER_ID?.toString() as string, 10)
  await client.$disconnect()
  clients.delete(id)
  await $`rm -rf ./prisma/${id}.db ./prisma/${id}.db-journal`
}

export class CtxBuilder {
  private readonly ctx: Partial<Ctx> = {}

  query (params: Record<string, any>): CtxBuilder {
    (this.ctx.query as any as unknown) = { ...this.ctx.query, ...params }
    return this
  }

  body (body: Record<string, any>): CtxBuilder {
    return this.request({ body })
  }

  owner (owner: { id: string }): CtxBuilder {
    return this.state({ owner })
  }

  database (database: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>): CtxBuilder {
    return this.state({ database })
  }

  request (body: any): CtxBuilder {
    (this.ctx.request as unknown as any) = { ...this.ctx.request, ...body }
    return this
  }

  state (state: Record<string, any>): CtxBuilder {
    (this.ctx.state as unknown as any) = { ...this.ctx.state, ...state }
    return this
  }

  params (state: Record<string, any>): CtxBuilder {
    (this.ctx.params as unknown as any) = { ...this.ctx.params, ...state }
    return this
  }

  build <Body = {}, Query = {}, Params ={}>(): Ctx {
    this.query({})
    return this.ctx as (Ctx & { request: { body: Body }, query: Query, params: Params })
  }
}
