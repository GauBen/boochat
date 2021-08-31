<script context="module" lang="ts">
  import type { Load } from '@sveltejs/kit'

  const response = { status: 307, redirect: '/register' }
  export const load: Load = () => response
</script>
