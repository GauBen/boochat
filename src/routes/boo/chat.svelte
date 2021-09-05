<script lang="ts">
  import type { Thread } from '../../messenger/types'
  import type { Socket } from '../../socket-api'
  import type {
    DetailedMessage,
    MessageUser,
    RichMessage,
    Team,
  } from '../../types'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import { get, GetRequest } from '../../api'
  import Messages from '../../messenger/Messages.svelte'
  import { Type } from '../../messenger/types'
  import { ServerEvent } from '../../socket-api'

  let socket: Socket | undefined
  let teams: Map<Team['id'], Team> = new Map()
  let thread: Thread = []
  const users = new Map<MessageUser['id'], MessageUser>()

  $: messages = new Map(
    thread
      .filter(
        (item): item is { type: Type.Basic; message: RichMessage } =>
          item.type === Type.Basic
      )
      .map(({ message }) => [message.id, message])
  )

  // eslint-disable-next-line @typescript-eslint/ban-types
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
    void get(GetRequest.Teams).then(({ body }) => {
      teams = new Map(body.map((team) => [team.id, team]))
    })

    void get(GetRequest.Messages).then(({ body }) => {
      // Load messages above notices
      thread = [
        ...body.messages.map((message) => {
          updateUsers(message)
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          return {
            type: body.type,
            message,
          } as
            | { type: Type.Basic; message: RichMessage }
            | { type: Type.Detailed; message: DetailedMessage }
        }),
        ...thread,
      ]
    })

    socket = io(':3001')

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
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
    color: #fff;
    font-weight: bold;
    text-shadow: 0 0 0.25rem #000;
  }

  :global(.messages) {
    overflow: hidden !important;
  }
</style>
