import { ZodObject, z } from 'zod'
import { Ctx } from '../types'
import { BailError, InternalServerError, UnprocessableEntity } from '../response'

type Empty = ZodObject<{}, 'strip', z.ZodTypeAny, {}, {}>

export class Builder<B extends Empty = Empty, P extends Empty = Empty, Q extends Empty = Empty> {
  private _params: Empty | undefined
  private _query: Empty | undefined
  private _body: Empty | undefined
  private _returns: ZodObject<any> | undefined
  private _action: ((ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>) => any) | undefined
  private _befores: Array<(ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>) => Promise<any>>
  private _afters: Array<(ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>) => Promise<any>>

  constructor () {
    this._params = undefined
    this._query = undefined
    this._body = undefined
    this._returns = undefined
    this._action = undefined
    this._befores = []
    this._afters = []
  }

  private async castBody (ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>): Promise<void> {
    const bodyResult = this._body?.safeParse(ctx.request.body)

    if (bodyResult !== undefined && !bodyResult.success) {
      throw new UnprocessableEntity(bodyResult.error)
    }
  }

  private async castParams (ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>): Promise<void> {
    const paramsResult = this._params?.safeParse(ctx.params)

    if (paramsResult !== undefined && !paramsResult.success) {
      throw new UnprocessableEntity(paramsResult.error)
    }
  }

  private async run (ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>): Promise<void> {
    if (this._returns === undefined || this._action === undefined) {
      throw new Error('Action is not properly configured. Please ensure it has a returns and action method.')
    }

    const actionResult = await this._action(ctx)
    const returnsResult = this._returns.safeParse(actionResult)
    if (!returnsResult.success) {
      throw new UnprocessableEntity(returnsResult.error)
    }
    ctx.body = {
      data: returnsResult.data
    }
  }

  build (): (ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>) => Promise<void> {
    return async (ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>) => {
      this._befores = [
        this.castBody.bind(this),
        this.castParams.bind(this),
        ...this._befores
      ]

      this._afters = [
        this.run.bind(this),
        ...this._afters
      ]

      try {
        await Promise.all(this._befores.map(async (before) => await before(ctx)))
        await Promise.all(this._afters.map(async (after) => await after(ctx)))
      } catch (error) {
        if (error instanceof BailError) {
          ctx.log.error(error.message)
          throw error
        }

        const e = error as Error
        ctx.log.error(e.message)
        throw new InternalServerError(e.message)
      }
    }
  }

  before (before: (ctx: Ctx) => Promise<void>): this {
    this._befores.push(before)
    return this
  }

  body <T extends Empty = Empty>(body: T): Builder<T, P> {
    this._body = body
    return this as unknown as Builder<T, P>
  }

  params <P extends Empty = Empty>(params: P): Builder<B, P> {
    this._params = params
    return this as unknown as Builder<B, P>
  }

  query <Q extends Empty = Empty>(query: Q): Builder<B, P, Q> {
    this._query = query
    return this as unknown as Builder<B, P, Q>
  }

  returns (returns: ZodObject<any>): this {
    this._returns = returns
    return this
  }

  action (action: (ctx: Ctx<z.infer<B>, z.infer<P>, z.infer<Q>>) => any): this {
    this._action = action
    return this
  }
}

export const Action = {
  create (func: (builder: Builder) => void) {
    const builder = new Builder()

    func(builder)

    return builder.build()
  }

}
