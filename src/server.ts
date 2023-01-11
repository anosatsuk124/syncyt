import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import { config } from 'dotenv';

const result = config({
    path: __dirname + '/../env/server/.env',
});

if (result.error) {
    throw result.error;
}

const PORT = Number(process.env.PORT) || 3000;

const app = express();
const server = http.createServer(app);

const io = new Server(server);

interface SyncData {
    currentPlayingTimestamp: number;
    sentTimestamp: Date;
}

io.on('connection', (socket) => {
    console.log(`a user connected: ${socket.id}`);
    socket.on('sync', (message: SyncData) => {
        console.log(`message: ${message}`);
        socket.broadcast.emit('sync', message);
    });
});

app.use('/', express.static(__dirname + '/../frontend/dist'));

server.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});
