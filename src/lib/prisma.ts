import Prisma from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: Prisma.PrismaClient
}

export const client = globalThis.prismaClient ?? new Prisma.PrismaClient()
globalThis.prismaClient ??= client
