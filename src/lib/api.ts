import type { GetType as GetTypeMessages } from '$routes/api/messages.json'
import type { GetType as GetTypeTeams } from '$routes/api/teams.json'

export interface ApiTypes {
  '/api/messages.json': GetTypeMessages
  '/api/teams.json': GetTypeTeams
}

/** Sends a typed GET request. */
export const get = async <T extends keyof ApiTypes>(
  uri: T,
  {
    fetch,
  }: {
    fetch: typeof globalThis.fetch
  } = globalThis
): Promise<Awaited<ReturnType<ApiTypes[T]>>> => {
  const response = await fetch(uri)
  if (response.status >= 400) throw new Error(response.statusText)
  return (await response.json()) as Awaited<ReturnType<ApiTypes[T]>>
}

/** Sends a typed POST request. */
export const post = async (
  uri: string,
  body: unknown = {},
  {
    fetch,
  }: {
    fetch: typeof globalThis.fetch
  } = globalThis
) => {
  const response = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (response.status >= 400) throw new Error(await response.text())
  return response.json()
}
