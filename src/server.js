import { createServer } from 'http';
import polka from 'polka';
import { Server } from 'socket.io';
import sirv from 'sirv';
import { statSync } from 'fs';

const { PORT = 3001 } = process.env;

const server = createServer();

const polkaServer = polka({ server });

try {
	if (statSync('build').isDirectory()) {
		polkaServer.use(sirv('build'));
		console.log('Starting in production mode');
	}
} catch (err) {
	console.log('Starting in development mode');
}

polkaServer.listen(PORT, () => {
	console.log(`> Running on localhost:${PORT}`);
});

const io = new Server(server);

io.on('connection', (socket) => {
	socket.on('chat message', (msg) => {
		io.emit('chat message', msg);
	});
});
