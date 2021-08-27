<script lang="ts">
  import type { User, Message, Team } from '@prisma/client'
  import { io, Socket } from 'socket.io-client'
  import { onMount } from 'svelte'
  import GameScreen from '../components/GameScreen.svelte'
  import Messages from '../messenger/Messages.svelte'

  let messages: Array<
    Message & {
      author: User & {
        team: Team
      }
    }
  > = []
  let socket: Socket | undefined

  const users = new Map<
    number,
    User & {
      team: Team
    }
  >()
  $: for (const message of messages) {
    const { author } = message
    if (!users.has(author.id)) users.set(author.id, author)

    const u = users.get(author.id)
    if (u) {
      message.author = u
      u.name = author.name
      u.team = author.team
    }
  }

  onMount(() => {
    fetch('//localhost:3001/api/messages')
      .then(async (r) => r.json())
      .then((m) => {
        messages = m
      })
      .catch((error) => {
        console.error(error)
      })

    socket = io(':3001')

    socket.on(
      'chat message',
      async (
        msg: Message & {
          author: User & {
            team: Team
          }
        }
      ) => {
        messages = [...messages.slice(-999), msg]
      }
    )

    socket.on('del message', async (id: number) => {
      messages = messages.filter((msg) => msg.id !== id)
    })
  })
</script>

<main>
  <Messages {messages} />
  <GameScreen {socket} />
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    padding: 1em 0;
    color: #fff;
    background-color: rgb(41, 37, 65);
  }

  :global(.messages) {
    // Hide the scrollbar and stay at the bottom
    justify-content: flex-end;
  }
</style>
