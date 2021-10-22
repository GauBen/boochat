<script context="module" lang="ts">
  import type { Me } from '../api'
  import type { RichMessage, Team } from '../types'
  import Gif from 'svelte-tenor/package/Gif.svelte'
  import twemoji from 'twemoji'

  export const richText = (
    node: HTMLElement,
    { me, body }: { body: string; me: Me | undefined }
  ): { update: (args: { body: string; me: Me | undefined }) => void } => {
    // Reset the text
    node.textContent = body

    // Replace emojis
    // eslint-disable-next-line import/no-named-as-default-member
    twemoji.parse(node, { folder: 'svg', ext: '.svg' })

    // Mark @name
    if (me) tag(node, me.name, me.team.color)

    return {
      update(args: { body: string; me: Me | undefined }) {
        richText(node, args)
      },
    }
  }

  /** Replaces `@name` with `<mark>@name</mark>`. */
  const tag = (node: HTMLElement, name: string, color: string) => {
    for (const child of node.childNodes) {
      if (child.nodeType !== Node.TEXT_NODE) continue
      const text = child.textContent
      const pattern = `@${name}`
      const index = text?.indexOf(pattern) ?? -1
      if (index === -1) continue
      const tag = (child as Text).splitText(index)
      tag.splitText(pattern.length)
      const mark = document.createElement('mark')
      mark.style.setProperty('--color', color)
      mark.append(tag)
      child.after(' ', mark, ' ')
    }
  }
</script>

<script lang="ts">
  export let teams: Map<Team['id'], Team>
  export let me: Me | undefined
  export let message: RichMessage

  $: ({ body, author, deleted, visible, gif } = message)
  $: ({
    color,
    name: teamName = '',
    code: teamCode = '',
  } = teams.get(author.teamId) ?? { color: '#fff', name: '', code: '' })
</script>

<p class:invisible={!visible} style="--color:{color}">
  {#if teamCode}
    <img src="/images/badges/{teamCode}.png" alt={teamName} />
  {:else}
    <span class="placeholder" />
  {/if}
  <strong>{author.name}</strong>:
  {#if deleted}
    <em>supprimé</em>
  {:else if gif}
    <span class="gif"><Gif medium={JSON.parse(body).media[0]} /></span>
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
