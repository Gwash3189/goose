import { Failure, Result, Success } from './types'

class _Cache {
  private readonly data: Map<string, { value: any, expiry: number }>

  constructor () {
    this.data = new Map()
  }

  set (key: string, value: any, { seconds }: { seconds: number }): void {
    const expiry = Date.now() + (seconds * 1000)
    this.data.set(key, { value, expiry })
  }

  get <X>(key: string): Result<X, null> {
    const data = this.data.get(key)
    if (data == null) {
      return Failure.from(null)
    }
    if (Date.now() > data.expiry) {
      this.data.delete(key)
      return Failure.from(null)
    }
    return Success.from(data.value)
  }
}

export const Cache = new _Cache()
