import { type Database } from './database'
import { type Owner } from '@prisma/client'
import { z } from 'zod'
import { DefaultContext, ExtendableContext, ParameterizedContext, Request } from 'koa'
import { ParsedUrlQuery } from 'querystring'

export class ErrorDto extends Error {
  constructor (public readonly result: z.SafeParseReturnType<{ [x: string]: any }, { [x: string]: any }>) {
    super()
  }
}

type ZodTuple = [z.ZodType<any, any, any>, unknown]
export type ZodTupleArray = ZodTuple[]

// export type Ctx<Params = { params: {} }, Query = { query: {} }, Body = { request: { body: {} } }> = RouterContext<{ database: Database, owner: Owner }> & Params & Query & Body
export interface Ctx<B = Record<string, any>, P = Record<string, any>, Q extends ParsedUrlQuery = Record<string, any>> extends ParameterizedContext<DefaultContext, ExtendableContext> {
  state: { database: Database, owner: Owner }
  request: { body: B } & Omit<Request, 'body'>
  params: P
  query: Q
}

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

export type Result<T, E> = Success<T> | Failure<E>
