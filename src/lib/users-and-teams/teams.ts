import { client } from '$lib/prisma'

export const getTeams = async () => client.team.findMany()
