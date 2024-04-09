import { Next } from 'koa'
import { Ctx } from '../types'

export abstract class AbstractBailError extends Error {
  abstract message: string
  abstract name: string
  abstract status: number
}

export class BailError extends AbstractBailError {
  message = 'Internal Server Error'
  name = 'InternalServerError'
  status = 500

  constructor (message?: string) {
    super(message)
    this.message = message ?? this.message
  }
}

export class BadRequest extends BailError {
  message = 'Bad Request'
  name = 'BadRequest'
  status = 400
}

export class InternalServerError extends BailError {}

export class NotFound extends BailError {
  message = 'Not Found'
  name = 'NotFound'
  status = 404
}

export class Unauthorized extends BailError {
  message = 'Unauthorized'
  name = 'Unauthorized'
  status = 403
}

export class UnprocessableEntity extends BailError {
  message = 'Unprocessable Entity'
  name = 'UnprocessableEntity'
  status = 422
}

export class ServiceUnavailable extends BailError {
  message = 'Service Unavailable'
  name = 'ServiceUnavailable'
  status = 503
}

export async function bail (ctx: Ctx, next: Next): Promise<void> {
  try {
    await next()
  } catch (error) {
    ctx.log.info('Error ocurred when running action. Checking if we should bail')
    if (error instanceof BailError) {
      ctx.log.info('Error is an instance of BailError. Bailing.', { message: error.message, status: error.status })
      ctx.status = error.status
      ctx.body = {
        error: {
          message: error.message
        }
      }
    } else {
      ctx.log.info('Unrecoverable error encountered. Sending 500 Internal Server Error and logging.')
      ctx.log.error(error)

      ctx.status = 500
      ctx.body = {
        error: {
          message: 'Internal Server Error'
        }
      }
    }
  }
}
