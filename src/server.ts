import { Server } from 'ws';
import express from 'express';
import http from 'http';
import { config } from 'dotenv';

const result = config({
    path: '../env/server/.env',
});

const PORT = Number(process.env.PORT) || 3000;

const app = express();
const server = http.createServer(app);

const wss = new Server({ server: server });
const clientsByChannel = new Map();

wss.on('connection', (client, req) => {
    const channel = new URL(
        req.url as string,
        `http://${req.headers.host}`
    ).pathname
        .split('/')
        .slice(-1)[0];

    if (!clientsByChannel.has(channel)) {
        clientsByChannel.set(channel, new Set());
    }

    clientsByChannel.get(channel).add(client);

    client.on('message', (data) => {
        for (const receiver of clientsByChannel.get(channel) || []) {
            if (receiver == client) continue;
            try {
                receiver.send(data);
            } catch (e) {
                console.warn(e);
            }
        }

        console.log('%s', data);
        client.send(data);
    });
});

app.use('/', express.static(__dirname + '/../frontend/dist'));

server.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`);
});
