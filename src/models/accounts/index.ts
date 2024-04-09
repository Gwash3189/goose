import { Account } from '@prisma/client'
import { Database, paginate } from '../../database'

type PermittedProperties = Record<keyof Account, boolean>
type CastedAccount = Account

export async function update (database: Database, { id, ownerId, name }: { id: string, name: string, ownerId: string }): Promise<CastedAccount> {
  return await database.account.update({
    where: {
      id,
      ownerId
    },
    data: {
      name
    },
    select: permitted()
  })
}

export async function create (database: Database, { name, ownerId }: { name: string, ownerId: string }): Promise<CastedAccount> {
  return await database.account.create({
    data: {
      name,
      ownerId
    },
    select: permitted()
  })
}

export async function del (database: Database, { id, ownerId }: { id: string, ownerId: string }): Promise<CastedAccount> {
  return await database.account.delete({
    where: {
      id,
      ownerId
    },
    select: permitted()
  })
}

export async function find (database: Database, { id, ownerId }: { id: string, ownerId: string }): Promise<CastedAccount> {
  return await database.account.findUniqueOrThrow({
    where: {
      id,
      ownerId
    },
    select: permitted()
  })
}

export async function many (database: Database, { ownerId, page = '0', pageSize = '10' }: { ownerId: string, page: string, pageSize: string }): Promise<CastedAccount[]> {
  const { take, offset } = paginate(page, pageSize)

  return await database.account.findMany({
    where: {
      ownerId
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
    createdAt: true,
    updatedAt: true,
    ownerId: true
  }
}
