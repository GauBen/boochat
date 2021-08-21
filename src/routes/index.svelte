<script lang="ts">
  import io from 'socket.io-client'
  import { tick } from 'svelte'

  const socket = io(':3001')

  let messages: string[] = []
  let value = ''
  let container: HTMLElement

  socket.on('chat message', async function (msg) {
    messages = [...messages, msg]
    if (
      container.scrollTop >
      container.scrollHeight - container.clientHeight - 10
    ) {
      await tick()
      container.scrollTo({ top: container.scrollHeight })
    }
  })

  const send = () => {
    socket.emit('chat message', value)
    value = ''
  }
</script>

<main>
  <div class="messages" bind:this={container}>
    {#each messages as message}
      <p>{message}</p>
    {/each}
  </div>

  <form on:submit|preventDefault={() => send()}>
    <input type="text" bind:value />
    <button>Envoyer</button>
  </form>
</main>

<style lang="scss">
  :global(body) {
    // TODO: use sanitize.css
    margin: 0;
    color: #fff;
    background-color: rgb(41, 37, 65);
  }

  main {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }

  .messages {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: auto;
    padding: 0 1em;

    > :first-child {
      margin-top: auto;
    }
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
      border-radius: 0.5em;
      border: 1px solid rgb(24, 24, 27);
      background: #fff;

      &:focus {
        box-shadow: 0 0 3px #fff;
        outline: 0;
      }
    }
  }
</style>
