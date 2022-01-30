import { prisma } from '$lib/prisma'
import type { User } from '@prisma/client'
import { nanoid } from 'nanoid'
import { getTeams } from './teams'

export const register = async ({
  name,
  teamId,
}: {
  name: User['name']
  teamId: User['teamId']
}) => {
  const teams = await getTeams()
  const team = teams.find((team) => team.id === teamId)
  if (!team || !team.pickable) throw new Error("Cette équipe n'existe pas.")

  if (!/^\w{2,20}$/.test(name))
    throw new Error('A-Z, 0-9 et _ uniquement, 2 à 20 caractères.')

  const found = await prisma.user.findUnique({ where: { name } })
  if (found) throw new Error('Ce compte existe déjà.')

  const token = nanoid()
  await prisma.user.create({
    data: { name, teamId, token },
    include: { team: true },
  })

  return { token }
}

export const fromToken = async ({ token }: { token: User['token'] }) => {
  const user = await prisma.user.findUnique({
    where: { token },
    include: { team: true },
  })
  if (!user) throw new Error('Not found')
  return user
}
