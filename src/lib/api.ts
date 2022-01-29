/** Sends a typed GET request. */
export const get = async <T extends () => unknown>(
  uri: string,
  {
    fetch,
  }: {
    fetch: typeof globalThis.fetch
  } = globalThis
): Promise<Awaited<ReturnType<T>>> => {
  const response = await fetch(uri)
  if (response.status >= 400) throw new Error(response.statusText)
  return (await response.json()) as Awaited<ReturnType<T>>
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
