import { getTeams } from '$lib/users-and-teams/teams'
import { client as prisma } from '$lib/prisma'
import { nanoid } from 'nanoid'
import { postFactory } from '$lib/handler-factory'

export const post = postFactory(
  {
    properties: {
      name: { type: 'string' },
      teamId: { type: 'int32' },
    },
  },
  async ({ body: { name, teamId } }) => {
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
)
