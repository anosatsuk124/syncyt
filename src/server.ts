import { Server } from 'socket.io';
import express from 'express';
import http from 'http';
import { config } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    const result = config({
        path: __dirname + '/../env/server/.env',
    });

    if (result.error) {
        throw result.error;
    }
}

const PORT = Number(process.env.PORT) || 3000;

const app = express();
const server = http.createServer(app);

const io = new Server(server);

interface SyncData {
    currentPlayingTimestamp: number;
    sentTimestamp: Date;
    userID: string;
}

const recivedSyncDataArray: SyncData[] = [];

io.on('connection', (socket) => {
    console.log(`a user connected: ${socket.id}`);

    socket.to(socket.id).emit('fetchId', socket.id);

    socket.on('sync', (data) => {
        const recivedSyncData = {
            currentPlayingTimestamp: data.currentPlayingTimestamp,
            sentTimestamp: new Date(data.sentTimestamp),
            userID: data.userID,
        };
        socket.broadcast.emit('sync', data);
    });
});

app.use('/', express.static(__dirname + '/../frontend/dist'));

server.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});
