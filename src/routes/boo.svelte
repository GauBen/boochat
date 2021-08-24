<script lang="ts">
  import type { User } from 'src/user'
  import { io } from 'socket.io-client'
  import { onMount } from 'svelte'
  import Messages from '../components/Messages.svelte'

  let messages: Array<{ login: User; msg: string; id: string }> = []

  onMount(() => {
    const socket = io(':3001')

    socket.on('chat message', async (msg) => {
      messages = [...messages.slice(-999), msg]
    })

    socket.on('del message', async (id: string) => {
      messages = messages.filter((msg) => msg.id !== id)
    })
  })
</script>

<main>
  <Messages {messages} />
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
