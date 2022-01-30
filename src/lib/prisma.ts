import Prisma from '@prisma/client'

declare global {
  // eslint-disable-next-line no-var
  var prismaClient: Prisma.PrismaClient
}

export const prisma = globalThis.prismaClient ?? new Prisma.PrismaClient()
globalThis.prismaClient ??= prisma
