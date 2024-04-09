import { User } from '@prisma/client'
import { Database } from '../../database'
import bcrypt from 'bcryptjs'

type PermittedProperties = Omit<Record<keyof User, boolean>, 'password'>
type CastedUser = Omit<User, 'password'>

export async function del (database: Database, { id, accountId }: { id: string, accountId: string }): Promise<CastedUser> {
  return await database.user.delete({
    where: {
      id,
      accountId
    },
    select: permitted()
  })
}

export async function update (database: Database, { id, accountId, name, email, password }: { id: string, accountId: string, name: string, email: string, password: string }): Promise<CastedUser> {
  return await database.user.update({
    data: {
      name,
      email,
      password: await bcrypt.hash(password, 10)
    },
    where: {
      id,
      accountId
    },
    select: permitted()
  })
}

export async function create (database: Database, { id, accountId, name, email, password }: { id: string, accountId: string, name: string, email: string, password: string }): Promise<CastedUser> {
  return await database.user.create({
    data: {
      id,
      accountId,
      name,
      email,
      password: await bcrypt.hash(password, 10)
    },
    select: permitted()
  })
}

export async function by (database: Database, props: any, withPassword = false): Promise<CastedUser | User> {
  const args: { where: any, select?: any } = {
    where: props
  }

  if (!withPassword) {
    args.select = permitted()
    return await database.user.findUniqueOrThrow(args)
  }

  return await database.user.findUniqueOrThrow(args) as CastedUser
}

export async function find (database: Database, { id, accountId }: { id: string, accountId: string }): Promise<CastedUser> {
  return await database.user.findUniqueOrThrow({
    where: {
      id,
      accountId
    },
    select: permitted()
  })
}

export async function many (database: Database, { accountId, page = '0', pageSize = '10' }: { accountId: string, page: string, pageSize: string }): Promise<CastedUser[]> {
  const take = parseInt(pageSize, 10)
  const offset = parseInt(page, 10) * take

  return await database.user.findMany({
    where: {
      accountId
    },
    skip: offset,
    take,
    select: permitted()
  })
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
