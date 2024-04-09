import { Owner, PrismaClient } from '@prisma/client'

export async function create (database: PrismaClient, props: Partial<Owner> = {}): Promise<Owner> {
  return await database.owner.create({
    data: {
      name: 'Test Owner',
      email: 'admin@admin.com',
      ...props
    }
  })
}

export async function drop (database: PrismaClient): Promise<void> {
  await database.owner.deleteMany()
}
