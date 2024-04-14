import { faker } from '@faker-js/faker'
import bcrypt from 'bcryptjs'
import { PrismaClient, User } from '@prisma/client'

export async function create (database: PrismaClient, props: Partial<User> = {}): Promise<User> {
  if (props.accountId !== undefined) {
    return await database.user.create({
      data: {
        name: props.name ?? faker.company.name(),
        password: await bcrypt.hash(props.password ?? 'password', 10),
        email: props.email ?? faker.internet.email(),
        accountId: props.accountId
      }
    })
  } else {
    return await database.user.create({
      data: {
        name: props.name ?? faker.company.name(),
        password: await bcrypt.hash(props.password ?? 'password', 10),
        email: props.email ?? faker.internet.email(),
        account: {
          create: {
            name: faker.company.name(),
            owner: {
              create: {
                name: faker.person.fullName(),
                email: faker.internet.email()
              }
            }
          }
        }
      }
    })
  }
}

export async function drop (database: PrismaClient): Promise<void> {
  await database.account.deleteMany()
}
