<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import { onMount } from 'svelte'

  export let socket: Socket | undefined = undefined

  let question = ''
  let msg = '...'

  onMount(() => {
    fetch('//localhost:3001/api/game-settings')
      .then(async (r) => r.json())
      .then((x) => {
        question = x.value
      })
      .catch((error) => {
        console.error(error)
      })
  })

  const listen = (socket: Socket | undefined) => {
    if (!socket) return
    socket.on('game', (evt) => {
      msg = evt
    })
    socket.on('game-settings', (x) => {
      question = x.value
    })
  }

  $: listen(socket)
</script>

<h1>{question}</h1>
<h2>{msg}</h2>
