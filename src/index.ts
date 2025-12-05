import 'reflect-metadata';
import { buildServer } from './server';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/database/mongodb/client';
import { connectRedis, disconnectRedis } from './infrastructure/database/redis/client';
import { config } from './config';
import { initializeSocketIO, closeSocketIO } from './infrastructure/socket/socketServer';
import { setupChatSocket } from './presentation/socket/chat.socket';
import { setupVideoSocket } from './presentation/socket/video.socket';

async function start() {
  try {
    // Connect to databases
    console.log('Connecting to databases...');
    await connectMongoDB();
    await connectRedis();
    console.log('Databases connected successfully');

    // Build and start server
    const server = await buildServer();
    
    await server.listen({
      port: config.port,
      host: config.host
    });

    // Initialize Socket.IO after server is listening
    const httpServer = server.server;
    const io = initializeSocketIO(httpServer);
    setupChatSocket(io);
    setupVideoSocket(io);

    console.log(`Server running at http://${config.host}:${config.port}`);
    console.log(`Socket.IO server initialized`);
    console.log(`Environment: ${config.nodeEnv}`);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        console.log(`\nReceived ${signal}, shutting down gracefully...`);
        
        closeSocketIO();
        await server.close();
        await disconnectMongoDB();
        await disconnectRedis();
        
        console.log('Server closed. Exiting process.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
