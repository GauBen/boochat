import adapter from '@sveltejs/adapter-node'
import path from 'path'
import preprocess from 'svelte-preprocess'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: preprocess(),

  kit: {
    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',
    adapter: adapter({}),
    vite: {
      server: {
        proxy: {
          '/socket.io': {
            target: 'ws://localhost:3001',
            ws: true,
          },
          '/api': {
            target: 'http://localhost:3001',
          },
        },
      },
      resolve: {
        alias: [
          { find: '$', replacement: path.resolve('src') },
          {
            find: /\$(components|games|lib|messenger|routes)\//,
            replacement: path.resolve('src') + '/$1/',
          },
        ],
      },
    },
  },
}

export default config
