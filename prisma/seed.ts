// eslint-disable-next-line import/default
import Prisma from '@prisma/client'

export const seed = async (): Promise<void> => {
  const prisma = new Prisma.PrismaClient()
  await prisma.team.create({
    data: {
      code: 'sn',
      name: 'SN',
      color: '#ff5e5e',
    },
  })
  await prisma.team.create({
    data: {
      code: 'eeea',
      name: 'EEEA',
      color: '#ffff00',
    },
  })
  await prisma.team.create({
    data: {
      code: 'mfee',
      name: 'MFEE',
      color: '#0099ff',
    },
  })
}
