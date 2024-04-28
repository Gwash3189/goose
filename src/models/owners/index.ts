import { Owner } from '@prisma/client'
import { Database } from '../../database'
import { Failure, Result, Success } from '../../types'

type PermittedProperties = Record<keyof Owner, true>
export type CastedOwner = Owner

export async function find (database: Database, { id }: { id: string }): Promise<Result<Owner, Error>> {
  try {
    const owner = await database.owner.findFirst({
      where: {
        id
      }
    })

    if (owner === null) {
      return Failure.from(new Error('Owner not found'))
    }

    return Success.from(owner)
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function many (database: Database): Promise<Result<CastedOwner[], Error>> {
  try {
    const owners = await database.owner.findMany()

    return Success.from(owners)
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export function permitted (): PermittedProperties {
  return {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    email: true
  }
}
