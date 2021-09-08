<script lang="ts">
  import type { Socket } from '../../socket-api'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { ServerEvent } from '../../socket-api'
  import { State } from './types'

  export let socket: Socket | undefined = undefined

  let question = ''
  let answers: string[] = []
  let category = ''
  let points = 1

  const anwserChosen = writable('')
  let disabled = false

  let state: State | undefined = State.Question

  onMount(() => {
    //
  })

  const listen = (socket: Socket | undefined) => {
    if (!socket) return

    socket.on(ServerEvent.QuestionStarts, (data) => {
      state = State.Question
      question = data.question
      answers = data.answers
      category = data.category
      points = data.points
      $anwserChosen = ''
      disabled = false
    })
  }

  $: listen(socket)

  anwserChosen.subscribe(() => {
    disabled = true
  })
</script>

<div class="controller">
  {#if state === undefined}
    Chargement...
  {:else if state === State.Question}
    <div class="question">
      <p class="category">{category}</p>
      <p class="points">{points} point{points > 1 ? 's' : ''}</p>
      <h2>{question}</h2>
      <div class="answers">
        {#each Object.entries(answers) as [i, answer]}
          <input
            type="radio"
            id="answer-{i}"
            bind:group={$anwserChosen}
            value={answer}
            {disabled}
          />
          <label for="answer-{i}">{answer}</label>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="scss">
  .controller {
    width: 100%;
    padding: 1rem;
  }

  .question {
    > .category {
      margin-bottom: 0;
      font-weight: bold;
      text-align: center;
      text-transform: uppercase;
    }
    > .points {
      margin-top: 0;
      text-align: center;
    }
  }

  .answers {
    position: relative;
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;

    > input {
      position: absolute;
      z-index: -1;
      opacity: 0;
    }

    > label {
      padding: 1rem;
      color: #222;
      font-weight: bold;
      background: #ccc;
      border-radius: 0.25rem;
    }

    > input:focus + label {
      box-shadow: 0 0 0.5rem var(--color);
    }

    > input:disabled + label {
      background: #888;
    }

    > input:checked + label {
      background: #fff;
      box-shadow: 0 0.25rem 0.25rem inset #888;
    }
  }
</style>
