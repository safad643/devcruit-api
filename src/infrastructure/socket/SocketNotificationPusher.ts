import { injectable } from 'inversify';
import { INotificationPusher } from '../../application/services/INotificationPusher';
import { Notification } from '../../domain/entities/Notification';
import { getSocketIO } from './socketServer';

@injectable()
export class SocketNotificationPusher implements INotificationPusher {
    push(userId: string, notification: Notification): void {
        try {
            const io = getSocketIO();
            io.to(`user:${userId}`).emit('notification:new', {
                id: notification.id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                read: notification.read,
                data: notification.data,
                createdAt: notification.createdAt,
            });
        } catch (error) {
            // Socket not initialized yet, log but don't fail
            console.error('[Notification] Failed to push notification:', error);
        }
    }

    pushToMultiple(userIds: string[], notification: Notification): void {
        for (const userId of userIds) {
            this.push(userId, notification);
        }
    }
}
