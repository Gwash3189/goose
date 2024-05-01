import { type Owner, type Account, type ApiKey } from '@prisma/client'
import { Database } from '../../database'
import { Failure, Result, Success } from '../../types'
import * as Owners from '../owners'
import * as Accounts from '../accounts'
import * as Users from '../users'
import { hash } from '../../security/hash'
import { randomUUID } from 'crypto'
import { FromNow } from '../../time'

type FindEntityType = (
  Owner | Account | Users.CastedUser
) & { type: 'owner' | 'account' | 'user' }

export function serialize (apiKey: ApiKey): string {
  return `${apiKey.id}::${apiKey.key}`
}

export function deserialize (serialized: string): { id: string, key: string } {
  const [id, key] = serialized.split('::')

  return { id, key }
}

export async function create (database: Database, { entity, expiresAt }: { entity: string, expiresAt?: Date }): Promise<Result<ApiKey, Error>> {
  try {
    const expires = expiresAt ?? FromNow.years(1)
    const initialKey = randomUUID()
    const keyResult = await hash(initialKey)

    if (!keyResult.success) {
      return Failure.from(new Error('Failed to generate API key'))
    }

    const keyRecord = await database.apiKey.create({
      data: {
        key: keyResult.data,
        entity,
        expiresAt: expires,
        expired: false
      }
    })

    return Success.from({ ...keyRecord })
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function list (database: Database, { entity }: { entity: string }): Promise<Result<ApiKey[], Error>> {
  try {
    const apiKeys = await database.apiKey.findMany({
      where: {
        entity
      }
    })

    return Success.from(apiKeys)
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function entity<X extends FindEntityType> (database: Database, { entityId }: { entityId: string }): Promise<Result<X, null>> {
  const owner = await Owners.find(database, { id: entityId })

  if (owner.success) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return Success.from({ ...owner.data, type: 'owner' } as X)
  }

  const account = await Accounts.find(database, { id: entityId })

  if (account.success) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return Success.from({ ...account.data, type: 'account' } as X)
  }

  const user = await Users.find(database, { id: entityId })

  if (user.success) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return Success.from({ ...user.data, type: 'user' } as X)
  }

  return Failure.from(null)
}

export async function find (database: Database, { id }: { id: string }): Promise<Result<ApiKey, Error>> {
  try {
    const apiKey = await database.apiKey.findFirst({
      where: {
        id
      }
    })

    if (apiKey === null) {
      return Failure.from(new Error('API key not found'))
    }

    return Success.from(apiKey)
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function del (database: Database, { id }: { id: string }): Promise<Result<ApiKey, Error>> {
  try {
    const apiKey = await database.apiKey.delete({
      where: {
        id
      }
    })

    return Success.from(apiKey)
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function rotate (database: Database, { id }: { id: string }): Promise<Result<ApiKey, Error>> {
  try {
    const expires = FromNow.years(1)
    const initialKey = randomUUID()
    const keyResult = await hash(initialKey)

    if (!keyResult.success) {
      return Failure.from(new Error('Failed to generate API key'))
    }

    const apiKey = await database.apiKey.update({
      where: {
        id
      },
      data: {
        key: keyResult.data,
        expiresAt: expires
      }
    })

    return Success.from(apiKey)
  } catch (error) {
    return Failure.from(error as Error)
  }
}
