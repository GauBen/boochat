<script lang="ts">
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { GetRequest } from '../../api'
  import { get } from '../../fetch'
  import Boo from '../../games/connect3/Boo.svelte'
  import type { Socket } from '../../socket-api'
  import { SOCKET_API } from '../../socket-api'
  import type { Team } from '../../types'

  let socket: Socket | undefined
  let teams: Map<Team['id'], Team> = new Map()

  onMount(async () => {
    void get(GetRequest.Teams).then(({ body }) => {
      teams = new Map(body.map((team) => [team.id, team]))
    })

    socket = io(SOCKET_API)
  })
</script>

<main>
  <Boo {teams} {socket} />
</main>

<style lang="scss">
  main {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    overflow: hidden;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 0 0.25rem #000;
  }
</style>
