import { type RouterContext } from 'koa-router'
import { type Database } from './database'
import { type Owner } from '@prisma/client'
import { z } from 'zod'
import { UnprocessableEntity } from './response'

export class ErrorDto extends Error {
  constructor (public readonly result: z.SafeParseReturnType<{ [x: string]: any }, { [x: string]: any }>) {
    super()
  }
}

type ZodTuple = [z.ZodType<any, any, any>, unknown]
export type ZodTupleArray = ZodTuple[]

// export type Ctx<Params = { params: {} }, Query = { query: {} }, Body = { request: { body: {} } }> = RouterContext<{ database: Database, owner: Owner }> & Params & Query & Body
export type Ctx = RouterContext<{ database: Database, owner: Owner }>

export function cast<X> (x: any): X {
  return x
}

export function ensure<X> (x: any, schema: z.ZodType): X {
  const result = schema.safeParse(x)

  if (result.success) {
    return result.data as X
  }

  throw new UnprocessableEntity(result.error.errors[0].message)
}

function parse<X> (x: X, schema: z.ZodType): z.SafeParseReturnType<{ [x: string]: any }, { [x: string]: any }> {
  return schema.safeParse(x)
}

export function all (arr: ZodTupleArray): true | z.SafeParseError<{ [x: string]: any }> {
  try {
    arr.forEach(([schema, value]) => {
      const result = parse(value, schema)
      if (!result.success) {
        throw new ErrorDto(result)
      }
    })
  } catch (error) {
    const err = error as ErrorDto
    return err.result as z.SafeParseError<{ [x: string]: any }>
  }

  return true
}

type FailureInput = any | z.SafeParseError<{ [x: string]: any }>
type FailureInputArray = FailureInput[]

export async function success <X = void> (result: any | z.SafeParseError<{ [x: string]: any }>, cb: () => Promise<X>): Promise<X> {
  if (!Result.cast(result)) { return undefined as any }
  return await cb()
}

export async function failure (result: any | z.SafeParseError<{ [x: string]: any }> | FailureInputArray, cb: () => Promise<void>): Promise<void> {
  if (Array.isArray(result)) {
    if (!Result.chain(...result)) {
      await cb()
    }
  }
  if (!Result.cast(result)) {
    await cb()
  }
}

export const Result = {
  chain (...results: any[]): boolean {
    return results.every((result) => Result.cast(result))
  },
  cast (value: any | z.SafeParseError<{ [x: string]: any }>): boolean {
    if (value?.success !== undefined) {
      return value.success
    }

    return Boolean(value)
  }
}
