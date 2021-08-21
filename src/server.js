import { createServer } from 'http';
import polka from 'polka';
import { Server } from 'socket.io';
import sirv from 'sirv';

const { PORT = 3001 } = process.env;

const files = sirv('build');
const server = createServer();

polka({ server })
	.use(files)
	.listen(PORT, () => {
		console.log(`> Running on localhost:${PORT}`);
	});

const io = new Server(server);

io.on('connection', (socket) => {
	socket.on('chat message', (msg) => {
		io.emit('chat message', msg);
	});
});
