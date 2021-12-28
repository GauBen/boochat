<script lang="ts">
  import type { Me } from '$/api'
  import { GetRequest, Level } from '$/api'
  import { get } from '$/fetch'
  import { ClientEvent, ServerEvent, Socket } from '$/socket-api'
  import type { DetailedMessage, MessageUser, RichMessage, Team } from '$/types'
  import { createEventDispatcher, onMount, tick } from 'svelte'
  import type { Gif } from 'svelte-tenor/api'
  import MessageInput from './MessageInput.svelte'
  import Messages from './Messages.svelte'
  import type { Thread } from './types'
  import { Type } from './types'

  export let me: Me | undefined = undefined
  export let mod = false
  export let socket: Socket | undefined
  export let teams: Map<Team['id'], Team>

  let thread: Thread = []
  let settings = { moderationDelay: 0, slowdown: 0 }
  let disabled = false
  let countdown = 0
  let input: HTMLInputElement

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

  let users = new Map<MessageUser['id'], MessageUser>()

  const updateUsers = (message: { author: Omit<MessageUser, 'inpId'> }) => {
    const { author } = message
    if (!users.has(author.id)) users = users.set(author.id, author)

    const user = users.get(author.id)
    if (user) {
      message.author = user
      user.name = author.name
      user.teamId = author.teamId
    }
  }

  const dispatch = createEventDispatcher<{ logout: void; send: string }>()

  onMount(async () => {
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
    void get(GetRequest.ChatSettings).then(({ body }) => {
      // Load messages above notices
      settings = body
    })
  })

  const setDeleted = (id: number, deleted: boolean) => {
    const message = messages.get(id)
    if (message) {
      message.deleted = deleted
      thread = thread
    }

    const detailedMessage = detailedMessages.get(id)
    if (detailedMessage) {
      detailedMessage.deleted = deleted
      thread = thread
    }
  }

  const listen = (socket: Socket | undefined) => {
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
      setDeleted(id, true)
    })
    socket.on(ServerEvent.RestoreMessage, async (id) => {
      setDeleted(id, false)
    })
  }

  $: listen(socket)

  const send = async () => {
    if (!socket || disabled) return
    socket.emit(ClientEvent.Message, value)
    value = ''
    await disableFields()
  }

  let gif = false
  let gifSearch = ''
  const sendGif = async ({ detail }: { detail: Gif }) => {
    gif = false
    await tick()
    gifSearch = ''
    if (!socket || disabled) return
    socket.emit(ClientEvent.Gif, detail.id)
    await disableFields()
  }

  const disableFields = async () => {
    if (me && me.level >= Level.Moderator) return
    input.classList.add('sending')
    disabled = true
    countdown = Math.floor(settings.slowdown / 1000)
    const interval = setInterval(() => countdown--, 1000)
    await new Promise((resolve) => {
      setTimeout(resolve, settings.slowdown)
    })
    clearInterval(interval)
    disabled = false
  }

  const del = ({ detail: id }: { detail: number }) => {
    if (!socket) return
    socket.emit(ClientEvent.DeleteMessage, id)
  }

  const restore = ({ detail: id }: { detail: number }) => {
    if (!socket) return
    socket.emit(ClientEvent.RestoreMessage, id)
  }
</script>

<div class="messenger">
  {#if me}
    <p class="center me">
      {#if me.level > Level.Chat}
        <label for="mod">
          <input type="checkbox" id="mod" bind:checked={mod} /> Modération
        </label>
      {/if}
      <span>
        <img
          src="/images/badges/{me.team.code}.png"
          alt={me.team.name}
          class="badge"
        />
        <strong>{me.name}</strong>
      </span>
      <a
        href="/logout"
        on:click|preventDefault={() => {
          dispatch('logout')
        }}>Se déconnecter</a
      >
    </p>
  {/if}

  <Messages {teams} {thread} {me} {mod} on:delete={del} on:restore={restore} />

  {#if me === undefined}
    <p class="center">Chargement...</p>
  {:else if me}
    <MessageInput
      bind:value
      bind:input
      bind:gifSearch
      bind:gif
      {countdown}
      {disabled}
      {settings}
      {me}
      {users}
      on:submit={send}
      on:submitGif={sendGif}
    />
  {:else}
    <p class="center"><a href="/login">Se connecter</a></p>
  {/if}
</div>

<style lang="scss">
  .messenger {
    display: flex;
    flex: 1;
    flex-direction: column;
    max-width: 100vw;
  }

  a {
    color: inherit;
  }

  .center {
    text-align: center;
  }

  .me {
    display: flex;
    gap: 1em;
    align-items: center;
    justify-content: center;

    img {
      width: 1.5em;
      height: 1.5em;
      vertical-align: bottom;
      background-color: var(--color);
      border-radius: 0.25rem;
    }

    strong {
      color: var(--color);
    }
  }
</style>
