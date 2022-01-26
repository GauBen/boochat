import type { GetType as GetTypeMessages } from '$routes/api/messages.json'
import type { GetType as GetTypeTeams } from '$routes/api/teams.json'

export interface ApiTypes {
  '/api/messages.json': GetTypeMessages
  '/api/teams.json': GetTypeTeams
}

export const get = async <T extends keyof ApiTypes>(
  uri: T,
  {
    fetch,
  }: {
    fetch: (
      input: RequestInfo,
      init?: RequestInit | undefined
    ) => Promise<globalThis.Response>
  } = globalThis
): Promise<Awaited<ReturnType<ApiTypes[T]>>> => {
  const response = await fetch(uri)
  if (response.status >= 400) throw new Error(response.statusText)
  return (await response.json()) as Awaited<ReturnType<ApiTypes[T]>>
}
