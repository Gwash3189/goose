import * as Accounts from '../../models/accounts'
import { create as CreateSchema } from './schemas'
import { UnprocessableEntity } from '../../response'
import { Action } from '../builder'

export const create = Action
  .create((builder) => {
    builder
      .body(CreateSchema.body)
      .returns(CreateSchema.returns)
      .action(async (ctx) => {
        const { name } = ctx.request.body
        const { id: ownerId } = ctx.state.owner
        const createResult = await Accounts
          .create(
            ctx.state.database,
            { name, ownerId }
          )

        if (!createResult.success) {
          throw new UnprocessableEntity()
        }

        return createResult.data
      })
  })
