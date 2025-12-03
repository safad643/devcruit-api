import { Type, Static } from '@sinclair/typebox';

export const ConversationIdParamsSchema = Type.Object({
  conversationId: Type.String({ minLength: 1 }),
});
export type ConversationIdParams = Static<typeof ConversationIdParamsSchema>;

export const GetMessagesQuerySchema = Type.Object({
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  beforeDate: Type.Optional(Type.String({ format: 'date-time' })),
});
export type GetMessagesQuery = Static<typeof GetMessagesQuerySchema>;

export const MarkMessagesAsReadSchema = Type.Object({
  messageIds: Type.Optional(
    Type.Array(Type.String({ minLength: 1 }), {
      minItems: 1,
      uniqueItems: true,
    })
  ),
});
export type MarkMessagesAsReadInput = Static<typeof MarkMessagesAsReadSchema>;

export const UserIdParamsSchema = Type.Object({
  userId: Type.String({ minLength: 1 }),
});
export type UserIdParams = Static<typeof UserIdParamsSchema>;

