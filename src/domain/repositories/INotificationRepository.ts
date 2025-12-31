import { Notification, NotificationProps } from '../entities/Notification';

export type CreateNotificationProps = Omit<NotificationProps, 'id'>;

export interface INotificationRepository {
    create(notification: CreateNotificationProps): Promise<Notification>;
    findByUserId(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
    findById(id: string): Promise<Notification | null>;
    markAsRead(id: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
    deleteOlderThan(days: number): Promise<number>;
}
