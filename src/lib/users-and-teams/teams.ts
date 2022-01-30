import { prisma } from '$lib/prisma'

export const getTeams = async () => prisma.team.findMany()
