import jwt, { type SignOptions } from 'jsonwebtoken'
import { Failure, Result, Success } from '../types'

export interface JwtPayload {
  id: string
  accountId: string
}

export const verify = (token: string, secret: string): Result<JwtPayload, false> => {
  try {
    return Success.from(jwt.verify(token, secret) as JwtPayload)
  } catch (error) {
    return Failure.from(false)
  }
}

export const sign = (payload: Record<string, string>, secret: string, options?: SignOptions): Result<string, false> => {
  try {
    return Success.from(jwt.sign(payload, secret, options ?? {}))
  } catch (error) {
    return Failure.from(false)
  }
}
