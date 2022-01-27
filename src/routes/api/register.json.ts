import { postFactory } from '$lib/handler-factory'
import { register } from '$lib/users-and-teams/users'

export type PostType = typeof register

export const post = postFactory(
  {
    properties: {
      name: { type: 'string' },
      teamId: { type: 'int32' },
    },
  },
  async ({ body: { name, teamId } }) => register({ name, teamId })
)
