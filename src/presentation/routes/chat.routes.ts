import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ChatController } from '../controllers/ChatController';
import { authenticate } from '../middleware/authenticate';
import {
  SendMessageSchema,
  ConversationIdParamsSchema,
  GetMessagesQuerySchema,
  MarkMessagesAsReadSchema,
  UserIdParamsSchema,
} from '../schemas/chat.schema';

export async function chatRoutes(fastify: FastifyInstance): Promise<void> {
  const chatController = container.get<ChatController>(TYPES.ChatController);

  fastify.post(
    '/messages',
    {
      preHandler: [authenticate],
      schema: {
        body: SendMessageSchema,
      },
    },
    chatController.sendMessage
  );

  fastify.get(
    '/conversations',
    {
      preHandler: [authenticate],
    },
    chatController.getConversations
  );

  fastify.get(
    '/conversations/:conversationId/messages',
    {
      preHandler: [authenticate],
      schema: {
        params: ConversationIdParamsSchema,
        querystring: GetMessagesQuerySchema,
      },
    },
    chatController.getMessages
  );

  fastify.post(
    '/conversations/:conversationId/read',
    {
      preHandler: [authenticate],
      schema: {
        params: ConversationIdParamsSchema,
        body: MarkMessagesAsReadSchema,
      },
    },
    chatController.markMessagesAsRead
  );

  fastify.get(
    '/can-message/:userId',
    {
      preHandler: [authenticate],
      schema: {
        params: UserIdParamsSchema,
      },
    },
    chatController.checkCanMessage
  );

  fastify.get(
    '/conversations/with/:userId',
    {
      preHandler: [authenticate],
      schema: {
        params: UserIdParamsSchema,
      },
    },
    chatController.getConversationWithUser
  );
}

