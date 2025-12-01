import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { FastifyInstance } from 'fastify';
import { config } from '../../config';

let io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  return io;
}

export function getSocketIO(): SocketIOServer {
  if (!io) {
    throw new Error('Socket.IO server not initialized. Call initializeSocketIO first.');
  }
  return io;
}

export function closeSocketIO(): void {
  if (io) {
    io.close();
    io = null;
  }
}

