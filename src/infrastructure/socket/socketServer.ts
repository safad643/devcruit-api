import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { FastifyInstance } from 'fastify';
import { config } from '../../config';

let _io: SocketIOServer | null = null;

export function initializeSocketIO(httpServer: HTTPServer): SocketIOServer {
  if (_io) {
    return _io;
  }

  _io = new SocketIOServer(httpServer, {
    cors: {
      origin: config.cors.origin,
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  });

  return _io;
}

export function getSocketIO(): SocketIOServer {
  if (!_io) {
    throw new Error('Socket.IO server not initialized. Call initializeSocketIO first.');
  }
  return _io;
}

export function closeSocketIO(): void {
  if (_io) {
    _io.close();
    _io = null;
  }
}

