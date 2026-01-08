import 'reflect-metadata';
import { buildServer } from './server';
import { connectMongoDB, disconnectMongoDB } from './infrastructure/database/mongodb/client';
import { ensureIndexes } from './infrastructure/database/mongodb/ensureIndexes';
import { connectRedis, disconnectRedis } from './infrastructure/database/redis/client';
import { config } from './config';
import { initializeSocketIO, closeSocketIO } from './infrastructure/socket/socketServer';
import { setupChatSocket } from './presentation/socket/chat.socket';
import { setupVideoSocket } from './presentation/socket/video.socket';
import { setupNotificationSocket } from './presentation/socket/notification.socket';
import { syncBlockedUsersToRedis } from './infrastructure/startup/syncBlockedUsers';

async function start() {
  try {
    // Connect to databases
    console.log('Connecting to databases...');
    await connectMongoDB();
    await connectRedis();
    console.log('Databases connected successfully');

    // Ensure database indexes
    await ensureIndexes();

    // Sync blocked users from MongoDB to Redis
    await syncBlockedUsersToRedis();

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
    setupNotificationSocket(io);

    server.log.info(`Server running at http://${config.host}:${config.port}`);
    server.log.info('Socket.IO server initialized');
    server.log.info(`Environment: ${config.nodeEnv}`);

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        server.log.info(`Received ${signal}, shutting down gracefully...`);

        closeSocketIO();
        await server.close();
        await disconnectMongoDB();
        await disconnectRedis();

        server.log.info('Server closed. Exiting process.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
