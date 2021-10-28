<script lang="ts">
  import type { Me } from '../api'
  import type { Socket } from 'socket.io-client'
  import Controller from '../games/connect3/Controller.svelte'

  export let socket: Socket | undefined = undefined
  export let me: Me | undefined = undefined
</script>

{#if me}
  <svelte:component this={Controller} {socket} {me} />
{:else if me === false}
  <a href="/login">Se connecter</a>
{/if}

<style>
  a {
    flex: 1;
    align-self: center;
    color: inherit;
    text-align: center;
  }
</style>
