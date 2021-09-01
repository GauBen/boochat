<script lang="ts">
  import type { Me } from '../api'
  import type { Socket } from 'socket.io-client'
  import Controller from '../games/quizz/Controller.svelte'

  export let socket: Socket | undefined = undefined
  export let me: Me | undefined = undefined
</script>

{#if me}
  <svelte:component this={Controller} {socket} />
{:else if me === false}
  <a href="/login">Se connecter</a>
{/if}

<style>
  a {
    flex: 1;
    align-self: center;
    text-align: center;
  }
</style>
