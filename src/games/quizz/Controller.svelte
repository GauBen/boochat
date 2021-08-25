<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import { onMount } from 'svelte'

  export let socket: Socket | undefined = undefined

  let ready = true
  let question = 'zerteyrtu'
  let n = 5

  onMount(() => {
    fetch('//localhost:3001/api/game-settings')
      .then(async (r) => r.json())
      .then((x) => {
        ready = true
        question = x.value
        n = x.n
      })
      .catch((error) => {
        console.error(error)
      })
  })

  const listen = (socket: Socket | undefined) => {
    if (!socket) return
    socket.on('game-settings', (x) => {
      question = x.value
      n = x.n
    })
  }

  $: listen(socket)
</script>

<div>
  {#if ready}
    <h1>{question}</h1>
    {#each [...Array.from({ length: n }).keys()] as i}
      <button
        on:click={() => {
          socket?.emit('game', i)
        }}
      >
        {i}
      </button>
    {/each}
  {/if}
</div>
