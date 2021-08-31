<script lang="ts">
  import type { Team } from '@prisma/client'
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'
  import { get, GetRequest, post, PostRequest } from '../api'

  let login = ''
  let team = 0
  let teams: Team[] | undefined
  let error: string | undefined

  const submit = async () => {
    const { body } = await post(PostRequest.Login, {
      login,
      teamId: team,
    })
    if ('error' in body) {
      error = body.error ?? 'Le serveur a rencontré une erreur...'
      return
    }

    sessionStorage.setItem('token', body.token)
    await goto('.')
  }

  onMount(async () => {
    teams = (await get(GetRequest.Teams)).body
  })
</script>

<form on:submit|preventDefault={async () => submit()}>
  <h1>Se connecter</h1>
  <label for="login">Nom d'utilisateur :</label>
  <input type="text" id="login" bind:value={login} />
  {#if error !== undefined}<p>❌ {error}</p>{/if}
  <h2>Equipe</h2>
  {#if teams}
    {#each teams as { id, name, color } (id)}
      <p>
        <label for="team-{id}" style="--color: {color}">
          <input
            type="radio"
            bind:group={team}
            value={id}
            id="team-{id}"
            name="team"
            required
          />
          <strong>{name}</strong>
        </label>
      </p>
    {/each}
  {:else}
    <p>Chargement...</p>
  {/if}
  <button>Se connecter</button>
</form>

<style>
  form {
    padding: 1em;
  }

  label > strong {
    color: var(--color);
  }
</style>
