<script lang="ts">
  import type {
    ClientToServerEvents,
    ServerToClientEvents,
  } from '../../socket-api'
  import type { Socket } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { get, GetRequest } from '../../api'
  import { ClientEvent, ServerEvent } from '../../socket-api'

  export let socket:
    | Socket<ServerToClientEvents, ClientToServerEvents>
    | undefined = undefined

  let ready = true
  let question = 'zerteyrtu'

  onMount(() => {
    get(GetRequest.GameSettings)
      .then(({ json }) => {
        question = json.value
        ready = true
      })
      .catch((error) => {
        console.error(error)
      })
  })

  const listen = (socket: Socket | undefined) => {
    if (!socket) return
    socket.on(ServerEvent.GameSettings, (x) => {
      question = x.value
    })
  }

  $: listen(socket)
</script>

<div>
  {#if ready}
    <h1>{question}</h1>
    <button
      on:click={() => {
        socket?.emit(ClientEvent.Game)
      }}
    >
      CLICK
    </button>
  {/if}
</div>
