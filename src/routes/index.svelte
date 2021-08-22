<script lang="ts">
  import type { Socket } from 'socket.io-client'
  import { io } from 'socket.io-client'
  import { onMount, tick } from 'svelte'
  import { goto } from '$app/navigation'
  import Message from '../components/Message.svelte'

  let messages: Array<{ login: string; msg: string; id: string }> = []
  let value = ''
  let container: HTMLElement
  let mod = false

  let socket: Socket | undefined

  onMount(async () => {
    const token = sessionStorage.getItem('token')
    if (token === null) {
      await goto('login')
      return
    }

    socket = io(':3001', {
      auth: { token },
    })

    socket.on('chat message', async (msg) => {
      messages = [...messages.slice(-999), msg]
      if (
        container.scrollTop >
        container.scrollHeight - container.clientHeight - 10
      ) {
        await tick()
        container.scrollTo({ top: container.scrollHeight })
      }
    })

    socket.on('del message', async (id: string) => {
      messages = messages.filter((msg) => msg.id !== id)
    })

    socket.on('disconnect', () => {
      location.href = 'login'
    })
  })

  const send = () => {
    if (!socket) return
    socket.emit('chat message', value)
    value = ''
  }

  const del = (id: string) => {
    if (!socket) return
    socket.emit('del message', id)
  }
</script>

<main>
  <p class="mod-toggle">
    <label for="mod">
      <input type="checkbox" id="mod" bind:checked={mod} /> Mod view
    </label>
  </p>

  <div class="messages" bind:this={container}>
    {#each messages as { id, login, msg } (id)}
      <Message
        {login}
        {msg}
        {mod}
        on:delete={() => {
          del(id)
        }}
      />
    {/each}
  </div>

  <form
    on:submit|preventDefault={() => {
      send()
    }}
  >
    <input type="text" bind:value />
    <button>Envoyer</button>
  </form>
</main>

<style lang="scss">
  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
    color: #fff;
    background-color: rgb(41, 37, 65);
  }

  form {
    display: flex;
    gap: 0.5em;
    padding: 1em;

    input {
      flex: 1;
    }

    input,
    button {
      padding: 0.5em;
      color: #000;
      background: #fff;
      border: 1px solid rgb(24, 24, 27);
      border-radius: 0.5em;

      &:focus {
        outline: 0;
        box-shadow: 0 0 3px #fff;
      }
    }
  }

  .mod-toggle {
    text-align: center;
  }

  .messages {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 1em;
    overflow: auto;

    > :global(:first-child) {
      margin-top: auto;
    }
  }
</style>
