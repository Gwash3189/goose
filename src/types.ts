import { type RouterContext } from 'koa-router'
import { type Database } from './database'
import { type Owner } from '@prisma/client'
import { z } from 'zod'

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

export function ensure<X> (x: any, schema: z.ZodType): Result<X, z.ZodError> {
  const result = schema.safeParse(x)

  if (result.success) {
    return Success.from(result.data as X)
  }

  return Failure.from(result.error)
}

interface TaggedType {
  kind: string
}

export interface Operation<P, F> extends TaggedType {
  readonly kind: `operation:${string}`
  params: P
  func: F
}

export interface Success<T> extends TaggedType {
  readonly kind: 'success'
  readonly success: true
  readonly data: T
}

export interface Failure<E> extends TaggedType {
  readonly kind: 'failure'
  readonly success: false
  readonly error: E
}

export class Success<T> implements Success<T> {
  static from<T>(data: T): Success<T> {
    return new Success(data)
  }

  public readonly kind = 'success'
  public readonly success = true
  constructor (public readonly data: T) {}
}

export class Failure<E> implements Failure<E> {
  static from<E>(err: E): Failure<E> {
    return new Failure(err)
  }

  public readonly kind = 'failure'
  public readonly success = false
  /* eslint-disable-next-line n/handle-callback-err */
  constructor (public readonly error: E) {}
}

export type Result<T, E> = (Success<T> | Failure<E>)
