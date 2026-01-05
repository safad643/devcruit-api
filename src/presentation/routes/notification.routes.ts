import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { NotificationController } from '../controllers/NotificationController';
import { authenticate } from '../middleware/authenticate';
import {
    GetNotificationsQuerySchema,
    NotificationIdParamsSchema,
} from '../schemas/notification.schema';

export async function notificationRoutes(fastify: FastifyInstance): Promise<void> {
    const notificationController = container.get<NotificationController>(TYPES.NotificationController);

    fastify.addHook('preHandler', authenticate);

    // GET /api/notifications - List notifications (paginated)
    fastify.get(
        '/',
        { schema: { querystring: GetNotificationsQuerySchema } },
        notificationController.getNotifications
    );

    // GET /api/notifications/unread - Get unread count only
    fastify.get(
        '/unread',
        notificationController.getUnreadCount
    );

    // PATCH /api/notifications/:notificationId/read - Mark one as read
    fastify.patch(
        '/:notificationId/read',
        { schema: { params: NotificationIdParamsSchema } },
        notificationController.markAsRead
    );

    // PATCH /api/notifications/read-all - Mark all as read
    fastify.patch(
        '/read-all',
        notificationController.markAllAsRead
    );
}
