import type { GetResponse as GetResponseMessages } from '$routes/api/messages.json'
import type { GetResponse as GetResponseTeams } from '$routes/api/teams.json'

export interface Response {
  '/api/messages.json': GetResponseMessages
  '/api/teams.json': GetResponseTeams
}

export const get = async <T extends keyof Response>(
  uri: T,
  {
    fetch,
  }: {
    fetch: (
      input: RequestInfo,
      init?: RequestInit | undefined
    ) => Promise<globalThis.Response>
  } = globalThis
) =>
  fetch(uri).then(async (response) => response.json()) as Promise<Response[T]>
