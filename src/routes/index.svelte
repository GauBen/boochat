<script lang="ts">
	import io from 'socket.io-client';

	const socket = io(':3001');

	let messages: string[] = [];
	let value: string;

	socket.on('chat message', function (msg) {
		messages = [...messages, msg];
	});

	const send = () => {
		socket.emit('chat message', value);
		value = '';
	};
</script>

{#each messages as message}
	<div>{message}</div>
{/each}

<form on:submit|preventDefault={() => send()}>
	<input type="text" bind:value />
	<button>Envoyer</button>
</form>
