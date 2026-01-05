// api/src/presentation/socket/chat.socket.ts

import { Server as SocketIOServer, Socket } from 'socket.io';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ITokenService } from '../../application/services';
import {
  IValidateConversationParticipantUseCase,
  ISendMessageUseCase,
  IMarkMessageAsReadUseCase,
} from '../../application/use-cases/chat';
import { server } from '../../server';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

const onlineUsers = new Map<string, Set<string>>();

export function setupChatSocket(io: SocketIOServer): void {
  const tokenService = container.get<ITokenService>(TYPES.TokenService);
  const validateParticipantUseCase = container.get<IValidateConversationParticipantUseCase>(
    TYPES.ValidateConversationParticipantUseCase
  );
  const sendMessageUseCase = container.get<ISendMessageUseCase>(TYPES.SendMessageUseCase);
  const markMessageAsReadUseCase = container.get<IMarkMessageAsReadUseCase>(
    TYPES.MarkMessageAsReadUseCase
  );

  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

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
    const userId = socket.userId!;
    const userRole = socket.userRole!;

    server.log.info({ userId }, '[Socket] User connected');

    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId)!.add(socket.id);

    socket.join(`user:${userId}`);

    io.emit('user:online', { userId, isOnline: true });

    const onlineUserIds = Array.from(onlineUsers.keys());
    socket.emit('users:online', onlineUserIds);

    socket.on('join-conversation', async (conversationId: string) => {
      try {
        const canJoin = await validateParticipantUseCase.execute(
          conversationId,
          userId,
          userRole
        );

        if (!canJoin) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }

        socket.join(`conversation:${conversationId}`);
        socket.emit('joined-room', conversationId);
        server.log.info({ userId, conversationId }, '[Socket] User joined conversation');
      } catch (error) {
        socket.emit('error', { message: 'Failed to join conversation' });
      }
    });

    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      server.log.info({ userId, conversationId }, '[Socket] User left conversation');
    });

    socket.on(
      'send-message',
      async (
        payload: { receiverId: string; message: string },
        callback?: (err?: string) => void
      ) => {
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
          };

          io.to(conversationRoom).emit('message:new', messagePayload);

          const conversationUpdate = {
            id: result.conversation.id,
            participant1Id: result.conversation.participant1Id,
            participant2Id: result.conversation.participant2Id,
            participant1Name: result.conversation.participant1Name,
            participant2Name: result.conversation.participant2Name,
            lastMessage: result.conversation.lastMessage,
            lastMessageAt: result.conversation.lastMessageAt,
            unreadCount: 0,
            createdAt: result.conversation.createdAt,
            updatedAt: result.conversation.updatedAt,
          };

          io.to(`user:${payload.receiverId}`).emit('conversation:updated', conversationUpdate);
          io.to(`user:${userId}`).emit('conversation:updated', conversationUpdate);

          callback?.();
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to send message';
          callback?.(message);
          socket.emit('error', { message });
        }
      }
    );

    socket.on(
      'mark-messages-read',
      async (
        payload: { conversationId: string; messageIds?: string[] },
        callback?: (err?: string) => void
      ) => {
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
      }
    );

    socket.on('user:typing', (payload: { conversationId: string; isTyping: boolean }) => {
      if (!payload?.conversationId) return;

      socket.to(`conversation:${payload.conversationId}`).emit('user:typing', {
        conversationId: payload.conversationId,
        userId,
        isTyping: payload.isTyping,
      });
    });

    socket.on('disconnect', () => {
      server.log.info({ userId }, '[Socket] User disconnected');

      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          io.emit('user:online', { userId, isOnline: false });
        }
      }
    });

    socket.on('error', (error) => {
      server.log.error({ userId, error }, '[Socket] Error');
    });
  });
}
