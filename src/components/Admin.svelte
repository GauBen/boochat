<script lang="ts">
  import type { Response } from '../api'
  import type {
    ClientToServerEvents,
    ServerToClientEvents,
  } from '../socket-api'
  import type { Socket } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { get, GetRequest } from '../api'
  import GameAdmin from '../games/quizz/Admin.svelte'
  import { ServerEvent } from '../socket-api'

  export let socket:
    | Socket<ClientToServerEvents, ServerToClientEvents>
    | undefined

  let stats: Response[GetRequest.UsersOnline] | undefined

  onMount(() => {
    void get(GetRequest.UsersOnline).then(({ json }) => {
      stats = json
    })
  })

  const listen = (
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  ) => {
    if (!socket) return

    socket.on(ServerEvent.Stats, async (x) => {
      stats = x
    })
  }

  $: listen(socket)
</script>

<div>
  {#if stats}
    <h2>Users online</h2>
    <p>{stats.online} personne(s) en ligne / {stats.connected} connectée(s)</p>
    {#each stats.users as { user, online } (user.id)}
      <strong style="color: {user.team.color}"
        >{user.name} (lvl {user.level})</strong
      >
      {online} session(s)<br />
    {/each}
  {:else}
    Chargement des stats...
  {/if}

  <svelte:component this={GameAdmin} />
</div>
