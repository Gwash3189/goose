import bcrypt from 'bcryptjs'
import { Failure, Result, Success } from '../types'

export async function compare (password: string, hashed: string): Promise<Result<true, false>> {
  try {
    const result = await bcrypt.compare(password, hashed)

    if (!result) {
      return Failure.from(false)
    }

    return Success.from(true)
  } catch (error) {
    return Failure.from(false)
  }
}

export async function hash (password: string): Promise<Result<string, false>> {
  try {
    return Success.from(await bcrypt.hash(password, 10))
  } catch (error) {
    return Failure.from(false)
  }
}
