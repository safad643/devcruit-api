import { Server as SocketIOServer, Socket } from 'socket.io';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ITokenService } from '../../application/services';
import {
  IValidateConversationParticipantUseCase,
  ISendMessageUseCase,
  IMarkMessageAsReadUseCase,
} from '../../application/use-cases/chat';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

export function setupChatSocket(io: SocketIOServer): void {
  const tokenService = container.get<ITokenService>(TYPES.TokenService);
  const validateParticipantUseCase = container.get<IValidateConversationParticipantUseCase>(TYPES.ValidateConversationParticipantUseCase);
  const sendMessageUseCase = container.get<ISendMessageUseCase>(TYPES.SendMessageUseCase);
  const markMessageAsReadUseCase = container.get<IMarkMessageAsReadUseCase>(TYPES.MarkMessageAsReadUseCase);

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

    socket.on('send-message', async (payload: { receiverId: string; message: string }, callback?: (err?: string) => void) => {
      try {
        if (!payload?.receiverId || !payload?.message) {
          throw new Error('receiverId and message are required');
        }

        const result = await sendMessageUseCase.execute({
          senderId: userId,
          senderRole: userRole,
          receiverId: payload.receiverId,
          message: payload.message,
        });

        const conversationRoom = `conversation:${result.conversation.id}`;
        socket.join(conversationRoom);

        const messagePayload = {
          id: result.message.id,
          conversationId: result.message.conversationId,
          senderId: result.message.senderId,
          message: result.message.message,
          readAt: result.message.readAt,
          createdAt: result.message.createdAt,
          conversation: {
            id: result.conversation.id,
            participant1Id: result.conversation.participant1Id,
            participant2Id: result.conversation.participant2Id,
            companyId: result.conversation.companyId,
            lastMessage: result.conversation.lastMessage,
            lastMessageAt: result.conversation.lastMessageAt,
            createdAt: result.conversation.createdAt,
            updatedAt: result.conversation.updatedAt,
          },
        };

        io.to(conversationRoom).emit('message:new', messagePayload);
        io.to(`user:${payload.receiverId}`).emit('conversation:updated', messagePayload.conversation);
        io.to(`user:${userId}`).emit('conversation:updated', messagePayload.conversation);

        callback?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to send message';
        callback?.(message);
        socket.emit('error', { message });
      }
    });

    socket.on('mark-messages-read', async (payload: { conversationId: string; messageIds?: string[] }, callback?: (err?: string) => void) => {
      try {
        if (!payload?.conversationId) {
          throw new Error('conversationId is required');
        }

        await markMessageAsReadUseCase.execute({
          conversationId: payload.conversationId,
          messageIds: payload.messageIds,
          userId,
        });

        io.to(`conversation:${payload.conversationId}`).emit('messages:read', {
          conversationId: payload.conversationId,
          userId,
          messageIds: payload.messageIds,
        });

        callback?.();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to mark messages as read';
        callback?.(message);
        socket.emit('error', { message });
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

