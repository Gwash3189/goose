import { Owner } from '@prisma/client'
import { Database } from '../../database'

type PermittedProperties = Record<keyof Owner, boolean>
export type CastedOwner = Owner

export async function many (database: Database): Promise<CastedOwner[]> {
  return await database.owner.findMany({
    select: permitted()
  })
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
