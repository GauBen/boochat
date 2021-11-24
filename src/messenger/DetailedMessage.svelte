<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Gif } from 'svelte-tenor'
  import type { Me } from '../api'
  import type { DetailedMessage, Team } from '../types'
  import { richText } from './Message.svelte'

  export let teams: Map<Team['id'], Team>
  export let me: Me | undefined
  export let message: DetailedMessage
  export let mod = false

  $: ({ body, author, deleted, visible, gif } = message)
  $: ({
    color,
    name: teamName = '',
    code: teamCode = '',
  } = teams.get(author.teamId) ?? { color: '#fff', name: '', code: '' })

  const dispatch = createEventDispatcher<{ delete: void; restore: void }>()
</script>

<p class:invisible={!visible} style="--color:{color}">
  {#if mod}
    <button
      on:click={() => {
        dispatch(deleted ? 'restore' : 'delete')
      }}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
      >
        {#if deleted}
          <path
            d="M18.885 3.515c-4.617-4.618-12.056-4.676-16.756-.195l-2.129-2.258v7.938h7.484l-2.066-2.191c2.82-2.706 7.297-2.676 10.073.1 4.341 4.341 1.737 12.291-5.491 12.291v4.8c3.708 0 6.614-1.244 8.885-3.515 4.686-4.686 4.686-12.284 0-16.97z"
          />
        {:else}
          <path
            d="M3 6v18h18v-18h-18zm5 14c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm5 0c0 .552-.448 1-1 1s-1-.448-1-1v-10c0-.552.448-1 1-1s1 .448 1 1v10zm4-18v2h-20v-2h5.711c.9 0 1.631-1.099 1.631-2h5.315c0 .901.73 2 1.631 2h5.712z"
          />
        {/if}
      </svg>
    </button>
  {/if}
  {#if teamCode}
    <img src="/images/badges/{teamCode}.png" alt={teamName} />
  {:else}
    <span class="placeholder" />
  {/if}
  <strong>{author.name}</strong>:
  {#if deleted}
    {#if mod && !gif}
      <span use:richText={{ body, me }} class:deleted />
    {:else}
      <em>
        {#if gif}gif {/if}supprimé
      </em>
    {/if}
  {:else if gif}
    <span class="gif"><Gif gif={JSON.parse(body)} /></span>
  {:else}
    <span use:richText={{ body, me }} />
  {/if}
</p>

<style lang="scss">
  p {
    margin: 0;

    :global(mark) {
      padding: 0 0.125em;
      background-color: var(--color);
      border-radius: 0.25rem;
      box-decoration-break: clone;
      line-break: strict;
    }

    :global(.emoji) {
      width: 1em;
      height: 1em;
      margin: 0 0.05em 0 0.1em;
      vertical-align: -0.1em;
    }
  }

  img {
    width: 1.5em;
    height: 1.5em;
    vertical-align: bottom;
    background-color: var(--color);
    border-radius: 0.25rem;
  }

  button {
    width: 1.5rem;
    height: 1.5rem;
    padding: 0;
    vertical-align: bottom;
    border: 0;

    > svg {
      width: 1rem;
      height: 1rem;
      vertical-align: middle;
    }

    &:focus {
      box-shadow: 0 0 0.5rem #fff;
    }
  }

  strong {
    color: var(--color);
  }

  .placeholder {
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
    vertical-align: bottom;
    background-color: var(--color);
    border-radius: 0.25rem;
  }

  .invisible {
    opacity: 0.5;
  }

  .deleted {
    text-decoration: line-through;
  }

  .gif {
    display: block;
    height: 8em;
    margin-top: 0.25em;
    overflow: hidden;

    :global(video) {
      width: auto;
      height: 100%;
    }
  }
</style>
