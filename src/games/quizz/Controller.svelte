<script lang="ts">
  import type { Socket } from 'socket.io-client'

  export let socket: Socket | undefined = undefined
</script>

<div>
  <button
    on:click={() => {
      socket?.emit('game', 'MUCH')
    }}
  >
    MUCH
  </button>
  <button
    on:click={() => {
      socket?.emit('game', 'CONTROLLER')
    }}
  >
    CONTROLLER
  </button>
  <button
    on:click={() => {
      socket?.emit('game', 'WOW')
    }}
  >
    WOW
  </button>
</div>
