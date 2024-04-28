import { User } from '@prisma/client'
import { Database } from '../../database'
import { Failure, Result, Success } from '../../types'
import { hash } from '../../security/hash'

type PermittedProperties = Omit<Record<keyof User, boolean>, 'password'>
export type CastedUser = Omit<User, 'password'>

export async function del (database: Database, { id, accountId }: { id: string, accountId: string }): Promise<Result<CastedUser, Error>> {
  try {
    return Success.from(await database.user.delete({
      where: {
        id,
        accountId
      },
      select: permitted()
    }))
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function update (database: Database, { id, accountId, name, email, password }: { id: string, accountId: string, name: string, email: string, password: string }): Promise<Result<CastedUser, Error>> {
  try {
    const hashed = await hash(password)

    if (!hashed.success) {
      return Failure.from(new Error('Failed to hash password'))
    }

    return Success.from(await database.user.update({
      data: {
        name,
        email,
        password: hashed.data
      },
      where: {
        id,
        accountId
      },
      select: permitted()
    }))
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function create (database: Database, { accountId, name, email, password }: { accountId: string, name: string, email: string, password: string }): Promise<Result<CastedUser, Error>> {
  try {
    const hashed = await hash(password)

    if (!hashed.success) {
      return Failure.from(new Error('Failed to hash password'))
    }

    return Success.from(await database.user.create({
      data: {
        accountId,
        name,
        email,
        password: hashed.data
      },
      select: permitted()
    }))
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export async function byEmail (database: Database, { email }: { email: string }): Promise<Result<User, false>> {
  const user = await database.user.findUnique({
    where: {
      email
    }
  })

  return user === null
    ? Failure.from(false)
    : Success.from(user)
}

export async function find (database: Database, { id, accountId }: { id: string, accountId?: string }): Promise<Result<CastedUser, false>> {
  const user = await database.user.findUnique({
    where: {
      id,
      accountId
    },
    select: permitted()
  })

  return user === null
    ? Failure.from(false)
    : Success.from(user)
}

export async function many (database: Database, { accountId, page = '0', pageSize = '10' }: { accountId: string, page: string, pageSize: string }): Promise<Result<CastedUser[], Error>> {
  const take = parseInt(pageSize, 10)
  const offset = parseInt(page, 10) * take

  try {
    return Success.from(await database.user.findMany({
      where: {
        accountId
      },
      skip: offset,
      take,
      select: permitted()
    }))
  } catch (error) {
    return Failure.from(error as Error)
  }
}

export function permitted (): PermittedProperties {
  return {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
    accountId: true
  }
}
