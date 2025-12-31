import { Server as SocketIOServer } from 'socket.io';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';


export function setupNotificationSocket(io: SocketIOServer): void {
    const notificationRepository = container.get<INotificationRepository>(TYPES.NotificationRepository);

    io.on('connection', async (socket) => {
        const userId = (socket as any).userId;

        if (!userId) {
            return; // Not authenticated, skip
        }

        try {
            // Send unread count on connect
            const unreadCount = await notificationRepository.getUnreadCount(userId);
            socket.emit('notification:unread-count', { unreadCount });
        } catch (error) {
            console.error('[Notification Socket] Failed to send unread count:', error);
        }

        // Listen for mark-as-read events from client
        socket.on('notification:mark-read', async (data: { notificationId?: string; markAll?: boolean }) => {
            try {
                if (data.markAll) {
                    await notificationRepository.markAllAsRead(userId);
                } else if (data.notificationId) {
                    await notificationRepository.markAsRead(data.notificationId);
                }

                // Send updated count
                const unreadCount = await notificationRepository.getUnreadCount(userId);
                socket.emit('notification:unread-count', { unreadCount });
            } catch (error) {
                console.error('[Notification Socket] Failed to mark as read:', error);
            }
        });
    });
}
