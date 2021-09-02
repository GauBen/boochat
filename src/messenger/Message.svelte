<script lang="ts">
  import type { Me, RichMessage } from '../api'
  import { createEventDispatcher } from 'svelte'
  import twemoji from 'twemoji'

  export let me: Me | undefined
  export let message: RichMessage
  export let mod = false

  $: ({ body, author, deleted, visible } = message)

  const dispatch = createEventDispatcher<{ delete: void }>()

  const richText = (
    node: HTMLElement,
    { me, body }: { body: string; me: Me | undefined }
  ) => {
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

<p class:invisible={!visible} class:deleted>
  <strong style="color:{author.team.color}">{author.name}:</strong>
  <span use:richText={{ body, me }} />
  {#if mod}
    <button
      on:click={() => {
        dispatch('delete')
      }}
      type="button">X</button
    >
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

  .invisible {
    opacity: 0.5;
  }

  .deleted {
    text-decoration: line-through;
  }
</style>
