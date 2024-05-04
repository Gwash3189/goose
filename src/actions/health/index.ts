import { Ctx } from '../../types'
import * as Owners from '../../models/owners'
import { ServiceUnavailable } from '../../response'
import { Action } from '../builder'
import { z } from 'zod'

export const show = Action
  .create((builder) => {
    builder
      .returns(z.object({
        healthy: z.boolean()
      }))
      .action(async (ctx: Ctx) => {
        const result = await Owners.many(ctx.state.database)

        if (!result.success) {
          throw new ServiceUnavailable()
        }

        return {
          healthy: result.data.length >= 0
        }
      })
  })
