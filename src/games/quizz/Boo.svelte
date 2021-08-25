<script lang="ts">
  import type { Socket } from 'socket.io-client'

  export let socket: Socket | undefined = undefined

  let msg = '...'

  const listen = (socket: Socket | undefined) => {
    if (!socket) return
    socket?.on('game', (evt) => {
      msg = evt
    })
  }

  $: listen(socket)
</script>

<h1>{msg}</h1>
