import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import type { ClientToServerEvents, ServerToClientEvents } from '@wip/shared';
import { registerHandlers } from './socket/handlers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:5173'],
  },
});

// 本番ではフロントエンドの静的ファイルを配信
if (process.env.NODE_ENV === 'production') {
  const frontendDist = join(__dirname, '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => {
    res.sendFile(join(frontendDist, 'index.html'));
  });
}

io.on('connection', (socket) => {
  console.log(`Connected: ${socket.id}`);
  registerHandlers(io, socket);
});

const PORT = process.env.PORT ?? 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
