import type { GetType as GetTypeMessages } from '$routes/api/messages.json'
import type { GetType as GetTypeTeams } from '$routes/api/teams.json'

export interface ApiTypes {
  '/api/messages.json': GetTypeMessages
  '/api/teams.json': GetTypeTeams
}

export const get = <T extends keyof ApiTypes>(
  uri: T,
  {
    fetch,
  }: {
    fetch: (
      input: RequestInfo,
      init?: RequestInit | undefined
    ) => Promise<globalThis.Response>
  } = globalThis
): ReturnType<ApiTypes[T]> =>
  fetch(uri).then(async (response) => response.json()) as ReturnType<
    ApiTypes[T]
  >
