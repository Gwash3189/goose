import { env } from 'process'
import { $ } from 'execa'
import { DefaultArgs } from '@prisma/client/runtime/library'
import { Prisma, PrismaClient } from '@prisma/client'
import { Ctx } from '../src/types'

const clients: Map<number, PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>> = new Map()

function databaseName (id: number): string {
  return `${id}-test.db`
}

export function getClient (): PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> {
  if (clients.size === 0) {
    createTestDatabase().catch(console.error)
  }

  return clients.get(parseInt(env.VITEST_WORKER_ID?.toString() as string, 10)) as PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>
}

export async function createTestDatabase (): Promise<void> {
  const id = parseInt(env.VITEST_WORKER_ID?.toString() as string, 10)
  env.DATABASE_URL = `file:./database/${databaseName(id)}?mode=memory&cache=shared`
  clients.set(id, new PrismaClient())
  await $`prisma db push --skip-generate --force-reset --accept-data-loss`
}

export const databaseTimeout = 10_000

export async function tearDownDatabase (client: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>): Promise<void> {
  const id = parseInt(env.VITEST_WORKER_ID?.toString() as string, 10)
  await client.$disconnect()
  clients.delete(id)
  await $`rm -rf ./prisma/database/${databaseName(id)} ./prisma/database/${databaseName(id)}-journal`
}

export class CtxBuilder {
  private readonly ctx: Partial<Ctx> = {}

  url (url: string): CtxBuilder {
    this.ctx.url = url
    return this
  }

  headers (headers: Record<string, any>): CtxBuilder {
    this.ctx.headers = { ...this.ctx.headers, ...headers }
    return this
  }

  query (params: Record<string, any>): CtxBuilder {
    (this.ctx.query as any as unknown) = { ...this.ctx.query, ...params }
    return this
  }

  body (body: Record<string, any>): CtxBuilder {
    (this.ctx.request as any) = this.ctx.request === undefined
      ? (this.ctx.request as any) = {}
      : this.ctx.request

    ;(this.ctx.request as any).body = { ...(this.ctx.request as any).body, ...body }

    return this
  }

  owner (owner: { id: string }): CtxBuilder {
    return this.state({ owner })
  }

  database (database: PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>): CtxBuilder {
    return this.state({ database })
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
    this.ctx.headers = { ...this.ctx.headers ?? {} }
    this.body({});
    (this.ctx.log as any) = {
      info: () => false,
      error: () => false,
      warn: () => false,
      debug: () => false
    };

    (this.ctx as unknown as any).set = (header: string, value: any) => {
      this.ctx.headers = { ...this.ctx.headers, [header]: value }
    }
    (this.ctx as unknown as any).get = (header: string) => {
      return (this.ctx.headers as Record<string, string>)[header]
    }
    return this.ctx as (Ctx & { request: { body: Body }, query: Query, params: Params })
  }
}

export interface Response<Data = Record<string, any>> { body: { data: Data } }
