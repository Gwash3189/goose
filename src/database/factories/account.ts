import { faker } from '@faker-js/faker'
import { Account, PrismaClient } from '@prisma/client'

export async function create (database: PrismaClient, props: Partial<Account> = {}): Promise<Account> {
  if (props.ownerId !== undefined) {
    return await database.account.create({
      data: {
        name: faker.company.name(),
        ownerId: props.ownerId,
        ...props
      }
    })
  } else {
    return await database.account.create({
      data: {
        name: props.name ?? faker.company.name(),
        owner: {
          create: {
            name: faker.company.name(),
            email: faker.internet.email()
          }
        }
      }
    })
  }
}

export async function drop (database: PrismaClient): Promise<void> {
  await database.account.deleteMany()
}
