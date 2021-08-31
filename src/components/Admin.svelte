<script lang="ts">
  import { onMount } from 'svelte'
  import { get, GetRequest } from '../api'
  import GameAdmin from '../games/quizz/Admin.svelte'

  onMount(() => {
    void get(GetRequest.UsersOnline)
  })
</script>

<svelte:component this={GameAdmin} />
