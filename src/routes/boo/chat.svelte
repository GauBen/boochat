<script lang="ts" context="module">
  import { get } from '$lib/api'
  import type { GetMessages } from '$routes/api/messages.json'
  import type { GetTeams } from '$routes/api/teams.json'
  import type { Load } from '@sveltejs/kit'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import Messages from '../../messenger/Messages.svelte'
  import { Thread, Type } from '../../messenger/types'
  import type { Socket } from '../../socket-api'
  import { ServerEvent } from '../../socket-api'
  import type { MessageUser, RichMessage, Team } from '../../types'

  export const load: Load = async ({ fetch }) => {
    const [teams, thread] = await Promise.all([
      get<GetTeams>('/api/teams.json', { fetch }).then(
        (response) => new Map(response.map((team) => [team.id, team]))
      ),
      get<GetMessages>('/api/messages.json', { fetch }).then((response) =>
        response.messages.map((message) => ({
          type: Type.Detailed,
          message,
        }))
      ),
    ])

    return {
      props: {
        teams,
        thread,
      },
    }
  }
</script>

<script lang="ts">
  export let teams: Map<Team['id'], Team> = new Map()
  export let thread: Thread = []

  let socket: Socket | undefined
  const users = new Map<MessageUser['id'], MessageUser>()

  $: messages = new Map(
    thread
      .filter(
        (item): item is { type: Type.Basic; message: RichMessage } =>
          item.type === Type.Basic
      )
      .map(({ message }) => [message.id, message])
  )

  const updateUsers = (message: { author: Omit<MessageUser, 'inpId'> }) => {
    const { author } = message
    if (!users.has(author.id)) users.set(author.id, author)

    const user = users.get(author.id)
    if (user) {
      message.author = user
      user.name = author.name
      user.teamId = author.teamId
    }
  }

  const setDeleted = (id: number, deleted: boolean) => {
    const message = messages.get(id)
    if (message) {
      message.deleted = deleted
      thread = thread
    }
  }

  onMount(async () => {
    socket = io()

    socket.on(ServerEvent.Message, async (message) => {
      updateUsers(message)
      thread = [...thread, { type: Type.Basic, message }]
    })

    socket.on(ServerEvent.Notice, async (message) => {
      thread = [...thread, { type: Type.Notice, message }]
    })

    socket.on(ServerEvent.DeleteMessage, async (id) => {
      setDeleted(id, true)
    })
    socket.on(ServerEvent.RestoreMessage, async (id) => {
      setDeleted(id, false)
    })
  })
</script>

<main>
  <Messages {thread} {teams} />
</main>

<style lang="scss">
  main {
    display: flex;
    overflow: hidden;
    height: 100vh;
    flex-direction: column;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 0 0.25rem #000;
  }

  :global(.messages) {
    overflow: hidden !important;
  }
</style>
