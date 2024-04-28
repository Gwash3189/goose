import { Failure, Result, Success } from './types'

class _Cache {
  private readonly data: Map<string, { value: any, expiry: number }>

  constructor () {
    this.data = new Map()
  }

  set (key: string, value: any, { milliseconds }: { milliseconds: number }): void {
    const expiry = Date.now() + milliseconds
    this.data.set(key, { value, expiry })
  }

  get <X>(key: string): Result<X, Error> {
    const data = this.data.get(key)
    if (data == null) {
      return Failure.from(new Error('Key not found'))
    }
    if (Date.now() > data.expiry) {
      this.data.delete(key)
      return Failure.from(new Error('Key expired'))
    }
    return Success.from(data.value)
  }

  clear (): void {
    this.data.clear()
  }
}

export const Cache = new _Cache()
