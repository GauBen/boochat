<script lang="ts">
  import twemoji from 'twemoji'

  export let login: string
  export let msg: string

  const emoji = (node: HTMLElement) => {
    twemoji.parse(node, { folder: 'svg', ext: '.svg' })
  }
</script>

<p>
  <strong>{login}:</strong>
  <span use:emoji>{msg}</span>
</p>

<style lang="scss">
  p {
    margin: 0;

    :global(.emoji) {
      height: 1em;
      width: 1em;
      margin: 0 0.05em 0 0.1em;
      vertical-align: -0.1em;
    }
  }
</style>
