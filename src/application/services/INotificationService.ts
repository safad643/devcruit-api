import { Notification, NotificationProps } from '../../domain/entities/Notification';

export interface CreateNotificationInput {
    userId: string;
    type: NotificationProps['type'];
    title: string;
    message: string;
    data?: Record<string, unknown>;
}

export interface CreateNotificationOutput {
    notification: Notification;
}

export interface INotificationService {
    create(input: CreateNotificationInput): Promise<CreateNotificationOutput>;
}
