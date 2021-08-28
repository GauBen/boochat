<script lang="ts">
  import type { Team } from '@prisma/client'
  import { onMount } from 'svelte'
  import { goto } from '$app/navigation'

  let login = ''
  let team = ''
  let teams: Team[] | undefined
  let error: string | undefined

  const submit = async () => {
    const response = await fetch(`//localhost:3001/api/login`, {
      method: 'POST',
      body: JSON.stringify({ login, teamId: team }),
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await response.json()
    if (response.status !== 200)
      error = data.error ?? 'Le serveur a rencontré une erreur...'

    if ('token' in data) {
      sessionStorage.setItem('token', data.token)
      await goto('.')
    } else if ('error' in data) {
      error = data.error
    }
  }

  onMount(async () => {
    teams = (await fetch(`//localhost:3001/api/teams`).then(async (r) =>
      r.json()
    )) as Team[]
    console.log(teams)
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
