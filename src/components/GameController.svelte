<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import Controller from '../games/quizz/Controller.svelte'

  export let socket: Socket | undefined = undefined
  export let loggedIn: boolean | undefined = undefined
</script>

{#if loggedIn}
  <svelte:component this={Controller} {socket} />
{:else}
  <a href="/login">Se connecter</a>
{/if}

<style>
  a {
    flex: 1;
    align-self: center;
    text-align: center;
  }
</style>
