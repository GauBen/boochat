<script lang="ts">
  import type { Me } from '../api'
  import type { MessageUser } from '../types'
  import { Level } from '../api'

  export let value = ''
  export let disabled = false
  export let countdown = 0
  export let settings = { moderationDelay: 0, slowdown: 0 }
  export let input: HTMLInputElement
  export let me: Me | undefined = undefined
  export let users = new Map<MessageUser['id'], MessageUser>()

  $: usernames = new Set([...users.values()].map(({ name }) => name))
  $: if (me && me.level <= Level.Banned) disabled = true

  let mobile = false
  let before = ''
  let after = ''
  let ac: HTMLInputElement
</script>

<form on:submit|preventDefault>
  <input
    bind:value
    bind:this={input}
    type="text"
    required
    autocomplete="off"
    list="commands"
    on:animationend={() => {
      input.style.setProperty('animation-play-state', 'paused')
    }}
    on:touchstart={() => {
      mobile = true
    }}
    on:keydown={(e) => {
      if (mobile || e.key !== '@') return
      before = value.slice(0, input.selectionStart ?? 0)
      after = value.slice(input.selectionStart ?? 0)
      ac.value = ''
      ac.focus()
    }}
    style="--delay: {settings.moderationDelay}ms"
  />
  <datalist id="commands">
    {#if me && me.level >= Level.Moderator}
      <option value="/ban ">/ban [user]</option>
      <option value="/mod ">/mod [user]</option>
      <option value="/reset ">/reset [user]</option>
      <option value="/admin ">/admin [password]</option>
    {/if}
  </datalist>
  <input
    bind:this={ac}
    type="text"
    autocomplete="off"
    list="autocomplete"
    on:input={() => {
      value = before + ac.value + after
      if (ac.value === '') {
        input.focus()
        return
      }

      if (
        usernames.has('@' + ac.value) ||
        [...usernames].filter((option) => option.startsWith(ac.value.slice(1)))
          .length === 0
      ) {
        input.focus()
        setTimeout(() => {
          input.setSelectionRange(
            before.length + ac.value.length,
            before.length + ac.value.length
          )
        })
      }
    }}
    on:keydown={(e) => {
      if (e.key === ' ') input.focus()
    }}
  />
  <datalist id="autocomplete">
    {#each [...usernames] as name}
      <option value={`@${name}`} />
    {/each}
  </datalist>
  <button {disabled}>
    Envoyer
    {#if disabled && countdown >= 0}
      <span class="countdown">{countdown} </span>
    {/if}
  </button>
</form>

<style lang="scss">
  form {
    position: relative;
    display: flex;
    gap: 0.5em;
    padding: 1em;

    input {
      flex: 1;
      background: linear-gradient(to right, #fff 50%, transparent 50.1%);
      background-color: #fff;
      background-position: 100% 100%;
      background-size: 200% 100%;
      animation: sending var(--delay) ease-out;
      animation-play-state: paused;
      animation-iteration-count: 0;
    }

    button {
      position: relative;
      overflow: hidden;
      background: #fff;
    }

    input,
    button {
      padding: 0.5em;
      color: #222;
      border: 0;
      border-radius: 0.5em;

      &:focus {
        outline: 0;
        box-shadow: 0 0 0.5rem var(--color);
      }
    }

    button:active {
      background-color: var(--color);
    }
  }

  [list='autocomplete'] {
    position: absolute;
    z-index: -1;
    opacity: 0;
  }

  form button:disabled {
    color: #666;
    background-color: #ccc;
  }

  .countdown {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    background-color: #ccc;
  }

  @keyframes sending {
    0% {
      background-position: 100% 100%;
    }
    5% {
      background-color: var(--color);
    }
    100% {
      background-color: var(--color);
      background-position: 0% 100%;
    }
  }
</style>
