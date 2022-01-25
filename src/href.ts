const port = String(import.meta.env.VITE_API_PORT ?? 3001)

export const api = (method: string): string =>
  new URL(
    `/api${method}`,
    ((root) => {
      if (process.env.NODE_ENV !== 'production') root.port = port
      return root
    })(new URL(location.origin))
  ).href
