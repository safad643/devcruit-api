import { Notification, NotificationProps } from '../../../domain/entities/Notification';

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

export interface GetNotificationsInput {
    userId: string;
    limit?: number;
    offset?: number;
}

export interface GetNotificationsOutput {
    notifications: Notification[];
    unreadCount: number;
}

export interface MarkNotificationReadInput {
    notificationId?: string;
    userId: string;
    markAll?: boolean;
}

export interface MarkNotificationReadOutput {
    success: boolean;
}

export interface ICreateNotificationUseCase {
    execute(input: CreateNotificationInput): Promise<CreateNotificationOutput>;
}

export interface IGetNotificationsUseCase {
    execute(input: GetNotificationsInput): Promise<GetNotificationsOutput>;
}

export interface IMarkNotificationReadUseCase {
    execute(input: MarkNotificationReadInput): Promise<MarkNotificationReadOutput>;
}
