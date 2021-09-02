<script lang="ts">
  import type { Me } from '../api'
  import type {
    ClientToServerEvents,
    ServerToClientEvents,
  } from '../socket-api'
  import type {
    Team,
    RichMessage,
    MessageUser,
    DetailedMessage,
  } from '../types'
  import type { Thread } from './types'
  import type { Socket } from 'socket.io-client'
  import { createEventDispatcher, onMount } from 'svelte'
  import { get, GetRequest, Level } from '../api'
  import { ClientEvent, ServerEvent } from '../socket-api'
  import Messages from './Messages.svelte'
  import { Type } from './types'

  export let me: Me | undefined = undefined
  export let mod = false
  export let socket:
    | Socket<ServerToClientEvents, ClientToServerEvents>
    | undefined = undefined
  export let teams: Map<Team['id'], Team>

  let thread: Thread = []

  $: if (thread.length > 1000) thread = thread.slice(-1000)

  $: messages = new Map(
    thread
      .filter(
        (item): item is { type: Type.Basic; message: RichMessage } =>
          item.type === Type.Basic
      )
      .map(({ message }) => [message.id, message])
  )
  $: detailedMessages = new Map(
    thread
      .filter(
        (item): item is { type: Type.Detailed; message: DetailedMessage } =>
          item.type === Type.Detailed
      )
      .map(({ message }) => [message.id, message])
  )

  let value = ''

  const users = new Map<number, MessageUser>()

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

  const dispatch = createEventDispatcher<{ logout: void; send: string }>()

  onMount(async () => {
    const { body } = await get(GetRequest.Messages)
    // Load messages above notices
    thread = [
      ...body.messages.map(
        (message) =>
          // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
          ({
            type: body.type,
            message,
          } as
            | { type: Type.Basic; message: RichMessage }
            | { type: Type.Detailed; message: DetailedMessage })
      ),
      ...thread,
    ]
  })

  const listen = (
    socket: Socket<ServerToClientEvents, ClientToServerEvents> | undefined
  ) => {
    if (!socket) return

    socket.on(ServerEvent.Connected, () => {
      thread = [
        ...thread,
        { type: Type.Notice, message: 'Bienvenue sur Boochat !' },
      ]
    })

    socket.on(ServerEvent.DetailedMessage, async (message) => {
      updateUsers(message)
      thread = [...thread, { type: Type.Detailed, message }]
    })

    socket.on(ServerEvent.Message, async (message) => {
      updateUsers(message)

      const detailedMessage = detailedMessages.get(message.id)
      if (detailedMessage) {
        detailedMessage.deleted = message.deleted
        detailedMessage.visible = message.visible
        thread = thread
        return
      }

      thread = [...thread, { type: Type.Basic, message }]
    })

    socket.on(ServerEvent.Notice, async (message) => {
      thread = [...thread, { type: Type.Notice, message }]
    })

    socket.on(ServerEvent.DeleteMessage, async (id) => {
      const m = messages.get(id)
      if (m) {
        m.deleted = true
        thread = thread
      }
    })
  }

  $: listen(socket)

  const send = () => {
    if (!socket) return
    socket.emit(ClientEvent.Message, value)
    value = ''
  }

  const del = ({ detail: id }: { detail: number }) => {
    if (!socket) return
    socket.emit(ClientEvent.DeleteMessage, id)
  }
</script>

<div class="messenger">
  {#if me}
    <p class="center">
      {#if me.level > Level.Chat}
        <label for="mod">
          <input type="checkbox" id="mod" bind:checked={mod} /> Mod view
        </label>
      {/if}
      <button
        type="button"
        on:click={() => {
          dispatch('logout')
        }}>Se déconnecter ({me.name})</button
      >
    </p>
  {/if}

  <Messages {teams} {thread} {me} {mod} on:delete={del} />

  {#if me === undefined}
    <p class="center">Chargement...</p>
  {:else if me}
    <form on:submit|preventDefault={send}>
      <input type="text" bind:value />
      <button>Envoyer</button>
    </form>
  {:else}
    <p class="center"><a href="/login">Se connecter</a></p>
  {/if}
</div>

<style lang="scss">
  .messenger {
    display: flex;
    flex: 1;
    flex-direction: column;
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

  a {
    color: inherit;
  }

  .center {
    text-align: center;
  }
</style>
