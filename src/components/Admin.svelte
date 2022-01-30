<script lang="ts">
  import type { ClientToServerEvents, ServerToClientEvents } from '$/socket-api'
  import { ServerEvent } from '$/socket-api'
  import type { Team, User } from '@prisma/client'

  import type { Socket } from 'socket.io-client'

  export let socket:
    | Socket<ClientToServerEvents, ServerToClientEvents>
    | undefined

  let stats:
    | {
        online: number
        connected: number
        users: Array<{
          user: User & {
            team: Team
          }
          online: number
        }>
      }
    | undefined

  const listen = (
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  ) => {
    if (!socket) return

    socket.on(ServerEvent.Stats, (x) => {
      stats = x
    })
  }

  $: listen(socket)
</script>

<div>
  {#if stats}
    <h2>Users online</h2>
    <p>{stats.online} personne(s) en ligne / {stats.connected} connectée(s)</p>
    <div class="scrollable">
      {#each stats.users as { user, online } (user.id)}
        <strong style:color={user.team.color}>
          {user.name} (lvl {user.level})
        </strong>
        {online} session(s)<br />
      {/each}
    </div>
  {:else}
    Chargement des stats...
  {/if}
</div>

<style lang="scss">
  .scrollable {
    overflow: auto;
    max-height: 50vh;
  }
</style>
