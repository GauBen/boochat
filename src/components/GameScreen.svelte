<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import Boo from '../games/quizz/Boo.svelte'

  export let socket: Socket | undefined
</script>

<svelte:component this={Boo} {socket} />
