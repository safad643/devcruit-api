import { Type, Static } from '@sinclair/typebox';

export const GetNotificationsQuerySchema = Type.Object({
    limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100, default: 50 })),
    offset: Type.Optional(Type.Integer({ minimum: 0, default: 0 })),
});
export type GetNotificationsQuery = Static<typeof GetNotificationsQuerySchema>;

export const NotificationIdParamsSchema = Type.Object({
    notificationId: Type.String({ minLength: 1 }),
});
export type NotificationIdParams = Static<typeof NotificationIdParamsSchema>;
