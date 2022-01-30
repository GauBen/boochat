import type { Handle } from '@sveltejs/kit'

export const handle: Handle = async ({ event, resolve }) => {
  if (!event.url.pathname.startsWith('/api/')) return resolve(event)
  console.log(`Proxying ${event.url.pathname}`)
  event.url.protocol = 'http'
  event.url.hostname = 'localhost'
  event.url.port = import.meta.env.VITE_API_PORT
  return fetch(event.url.toString(), event.request)
}
