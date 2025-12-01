import { Server as SocketIOServer, Socket } from 'socket.io';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ITokenService } from '../../application/services';
import { IValidateConversationParticipantUseCase } from '../../application/use-cases/chat/interfaces/IValidateConversationParticipantUseCase';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function setupChatSocket(io: SocketIOServer): void {
  const tokenService = container.get<ITokenService>(TYPES.TokenService);
  const validateParticipantUseCase = container.get<IValidateConversationParticipantUseCase>(TYPES.ValidateConversationParticipantUseCase);

  // Authentication middleware for Socket.IO
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token missing'));
      }

      const payload = tokenService.verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.userRole = payload.role;

      next();
    } catch (error) {
      return next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    // Middleware already validated and set userId/userRole, so they're guaranteed to exist
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    console.log(`User connected: ${userId} (${userRole})`);

    // Join user's personal room for direct messaging
    socket.join(`user:${userId}`);

    // Handle joining a conversation room
    socket.on('join-conversation', async (conversationId: string) => {
      try {
        // This validates both: 1) user is participant, 2) user has authorization to message the other participant
        const canJoin = await validateParticipantUseCase.execute(conversationId, userId, userRole);
        
        if (!canJoin) {
          socket.emit('error', { message: 'You are not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        console.log(`User ${userId} joined conversation ${conversationId}`);
      } catch (error) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    // Handle leaving a conversation room
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${userId} left conversation ${conversationId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for user ${userId}:`, error);
    });
  });
}

