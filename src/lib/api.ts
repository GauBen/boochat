/** Sends a typed GET request. */
// @ts-expect-error The signatures can't match
export async function get<T extends (searchParams: never) => unknown>(
  uri: string,
  options: {
    fetch?: typeof globalThis.fetch
    params: T extends (searchParams: infer U) => unknown ? U : never
  }
): Promise<Awaited<ReturnType<T>>>
export async function get<T extends () => unknown>(
  uri: string,
  options?: { fetch?: typeof globalThis.fetch }
): Promise<Awaited<ReturnType<T>>>
export async function get(
  uri: string,
  {
    fetch = globalThis.fetch,
    params,
  }: { fetch?: typeof globalThis.fetch; params?: Record<string, string> } = {}
): Promise<unknown> {
  const search = params ? new URLSearchParams(params).toString() : ''
  const response = await fetch(uri + (search ? '?' + search : ''))
  if (response.status >= 400) throw new Error(response.statusText)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json()
}

/** Sends a typed POST request. */
export const post = async <T extends (body: never) => unknown>(
  uri: string,
  body: T extends (body: infer U) => unknown ? U : never,
  {
    fetch,
  }: {
    fetch: typeof globalThis.fetch
  } = globalThis
): Promise<ReturnType<T>> => {
  const response = await fetch(uri, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (response.status >= 400) throw new Error(await response.text())
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return response.json()
}
