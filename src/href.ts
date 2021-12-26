const port = String(import.meta.env.VITE_API_PORT ?? 3001)

export const api = (method: string): string =>
  new URL(
    `/api${method}`,
    ((root) => {
      if (process.env.NODE_ENV !== 'production') root.port = port
      return root
    })(new URL(location.origin))
  ).href

// eslint-disable-next-line @typescript-eslint/naming-convention
export const SOCKET_API =
  process.env.NODE_ENV === 'production' ? '/' : `:${port}`
