<script lang="ts">
  import type { User, Message } from 'src/entities'
  import { io, Socket } from 'socket.io-client'
  import { onMount } from 'svelte'
  import GameScreen from '../components/GameScreen.svelte'
  import Messages from '../messenger/Messages.svelte'

  let messages: Message[] = []
  let socket: Socket | undefined

  const users = new Map<string, User>()
  $: for (const message of messages) {
    const { login } = message
    if (!users.has(login.id)) users.set(login.id, login)

    const l = users.get(login.id)
    if (l) {
      message.login = l
      l.name = login.name
      l.team = login.team
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

    socket.on('chat message', async (msg: Message) => {
      messages = [...messages.slice(-999), msg]
    })

    socket.on('del message', async (id: string) => {
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
