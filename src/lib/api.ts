import type { GetType as GetTypeMessages } from '$routes/api/messages.json'
import type { PostType as PostTypeRegister } from '$routes/api/register.json'
import type { GetType as GetTypeTeams } from '$routes/api/teams.json'

export interface GetApiTypes {
  '/api/messages.json': GetTypeMessages
  '/api/teams.json': GetTypeTeams
}

export interface PostApiTypes {
  '/api/register.json': PostTypeRegister
}

/** Sends a typed GET request. */
export const get = async <T extends keyof GetApiTypes>(
  uri: T,
  {
    fetch,
  }: {
    fetch: typeof globalThis.fetch
  } = globalThis
): Promise<Awaited<ReturnType<GetApiTypes[T]>>> => {
  const response = await fetch(uri)
  if (response.status >= 400) throw new Error(response.statusText)
  return (await response.json()) as Awaited<ReturnType<GetApiTypes[T]>>
}

/** Sends a typed POST request. */
export const post = async <T extends keyof PostApiTypes>(
  uri: string,
  body: unknown = {},
  {
    fetch,
  }: {
    fetch: typeof globalThis.fetch
  } = globalThis
): Promise<Awaited<ReturnType<PostApiTypes[T]>>> => {
  const response = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (response.status >= 400) throw new Error(await response.text())
  return (await response.json()) as Awaited<ReturnType<PostApiTypes[T]>>
}
