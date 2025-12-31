import { Notification } from '../../domain/entities/Notification';

export interface INotificationPusher {
    push(userId: string, notification: Notification): void;
    pushToMultiple(userIds: string[], notification: Notification): void;
}
