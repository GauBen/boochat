<script lang="ts">
  import type { Me } from '$/api'
  import { Level } from '$/api'
  import type { MessageUser } from '$/types'
  import { createEventDispatcher } from 'svelte'
  import { MobileKeyboard } from 'svelte-tenor'
  import type { Gif } from 'svelte-tenor/api'

  export let value = ''
  export let disabled = false
  export let countdown = 0
  export let settings = { moderationDelay: 0, slowdown: 0 }
  export let input: HTMLInputElement
  export let me: Me | undefined = undefined
  export let users = new Map<MessageUser['id'], MessageUser>()
  export let gif = false
  export let gifSearch = ''

  const dispatch = createEventDispatcher<{ submitGif: Gif }>()

  $: usernames = new Set([...users.values()].map(({ name }) => name))
  $: if (me && me.level <= Level.Banned) disabled = true

  let mobile = false
  let before = ''
  let after = ''
  let ac: HTMLInputElement
</script>

{#if gif}
  <div class="keyboard">
    <MobileKeyboard
      key={import.meta.env.VITE_TENOR_API_KEY}
      messages={{
        placeholder: 'Chercher sur Tenor',
        close: 'Aa',
        error: 'Tenor est indisponible',
        retry: 'Réessayer',
      }}
      gap={8}
      bind:q={gifSearch}
      on:click={({ detail }) => {
        dispatch('submitGif', detail)
      }}
      on:close={() => {
        gif = false
      }}
    />
  </div>
{:else}
  <form on:submit|preventDefault>
    <button
      {disabled}
      type="button"
      on:click={() => {
        gif = true
      }}
      style="font-family:cursive"
    >
      Gif
    </button>
    <input
      bind:value
      bind:this={input}
      type="text"
      required
      autocomplete="off"
      list="commands"
      class:sending={false}
      on:animationend={() => {
        input.classList.remove('sending')
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
          [...usernames].filter((option) =>
            option.startsWith(ac.value.slice(1))
          ).length === 0
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
    <button {disabled} type="submit">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        <path d="M8.122 24l-4.122-4 8-8-8-8 4.122-4 11.878 12z" />
      </svg>
      {#if disabled && countdown >= 0}
        <span class="countdown">{countdown} </span>
      {/if}
    </button>
  </form>
{/if}

<style lang="scss">
  button {
    position: relative;
    overflow: hidden;
    flex-shrink: 0;
    padding: 0.5em;
    border: 0;
    background: #fff;
    border-radius: 0.5em;
    color: #222;

    &:focus {
      box-shadow: 0 0 0.5rem var(--color);
      outline: 0;
    }

    &:active {
      background-color: var(--color);
    }

    &:disabled {
      background-color: #ccc;
      color: #666;
    }
  }

  form {
    position: relative;
    display: flex;
    padding: 1em;
    gap: 0.5em;

    input {
      flex: 1;
      padding: 0.5em;
      border: 0;
      background: linear-gradient(to right, #fff 50%, transparent 50.1%);
      background-color: #fff;
      background-position: 100% 100%;
      background-size: 200% 100%;
      border-radius: 0.5em;
      color: #222;

      &:focus {
        box-shadow: 0 0 0.5rem var(--color);
        outline: 0;
      }

      &.sending {
        animation: sending var(--delay) ease-out;
        animation-iteration-count: 1;
        animation-play-state: running;
      }
    }
  }

  [list='autocomplete'] {
    position: absolute;
    z-index: -1;
    opacity: 0;
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
    background-color: #ccc;
    color: #666;
  }

  .keyboard {
    overflow: auto;
    padding: 1em;
    margin-top: 0.5rem;
    background-color: #333;
    border-radius: 0.75rem 0.75em 0 0;
    box-shadow: 0 0 0 1px #444, 0 0 0.5em #111;

    :global {
      .row > button {
        padding: 0.25em 0.5em;
      }

      .row > input {
        padding: 0.25em;
      }

      .row > button,
      .row > input {
        border: 0;
        background-color: #fff;
        border-radius: 0.5em;
        color: #222;

        &:focus {
          box-shadow: 0 0 0.5rem var(--color);
          outline: 0;
        }
      }
    }
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
