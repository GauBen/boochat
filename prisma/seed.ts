// eslint-disable-next-line import/default
import Prisma from '@prisma/client'

const prisma = new Prisma.PrismaClient()
const seed = async (): Promise<void> => {
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

seed().finally(async () => prisma.$disconnect())
