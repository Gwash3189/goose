import { Account } from '@prisma/client'
import { Database, paginate } from '../../database'
import { Failure, Result, Success } from '../../types'

type PermittedProperties = Record<keyof Account, boolean>
type CastedAccount = Account

export async function update (database: Database, { id, ownerId, name }: { id: string, name: string, ownerId: string }): Promise<Result<CastedAccount, Error>> {
  try {
    return Success.from(await database.account.update({
      where: {
        id,
        ownerId
      },
      data: {
        name
      },
      select: permitted()
    }))
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function create (database: Database, { name, ownerId }: { name: string, ownerId: string }): Promise<Result<CastedAccount, Error>> {
  try {
    return Success.from(await database.account.create({
      data: {
        name,
        ownerId
      },
      select: permitted()
    }))
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function del (database: Database, { id, ownerId }: { id: string, ownerId: string }): Promise<Result<CastedAccount, Error>> {
  try {
    return Success.from(await database.account.delete({
      where: {
        id,
        ownerId
      },
      select: permitted()
    }))
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function find (database: Database, { id, ownerId }: { id: string, ownerId: string }): Promise<Result<CastedAccount, Error>> {
  try {
    const account = await database.account.findUnique({
      where: {
        id,
        ownerId
      },
      select: permitted()
    })

    if (account === null) {
      return Failure.from(new Error('Account not found'))
    }

    return Success.from(account)
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function many (database: Database, { ownerId, page = '0', pageSize = '10' }: { ownerId: string, page: string, pageSize: string }): Promise<Result<CastedAccount[], Error>> {
  const { take, offset } = paginate(page, pageSize)

  try {
    return Success.from(await database.account.findMany({
      where: {
        ownerId
      },
      take,
      skip: offset,
      select: permitted()
    }))
  } catch (e) {
    return Failure.from(e as Error)
  }
}

export function permitted (): PermittedProperties {
  return {
    id: true,
    name: true,
    createdAt: true,
    updatedAt: true,
    ownerId: true
  }
}
