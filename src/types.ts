import { type RouterContext } from 'koa-router'
import { type Database } from './database'
import { type Owner } from '@prisma/client'
import { z } from 'zod'
import { BadRequest } from './response'

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

  throw new BadRequest(result.error.errors[0].message)
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

type Input = any | z.SafeParseError<{ [x: string]: any }>
type InputArray = Input[]

export async function success <In, X = void> (result: any, cb: (result: NonNullable<In>) => Promise<X>): Promise<X> {
  if (Array.isArray(result) && !result.every(Boolean)) {
    return undefined as any
  }

  if (!(result as boolean) || (result)?.success === false) {
    return undefined as any
  }

  return await cb(result)
}

export async function failure <X = void> (result: Input | InputArray, cb: () => Promise<X>): Promise<X | undefined> {
  if (!(result as boolean) || result?.success === false ||
    (Array.isArray(result) && result.some(x => x === false))) {
    return await cb()
  }

  return undefined
}
