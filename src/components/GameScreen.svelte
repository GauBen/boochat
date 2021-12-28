<script lang="ts">
  import Boo from '$games/quizz/Boo.svelte'
  import type { Socket } from 'socket.io-client'

  export let socket: Socket | undefined
</script>

<svelte:component this={Boo} {socket} />
