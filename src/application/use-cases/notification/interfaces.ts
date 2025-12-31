import { Notification } from '../../../domain/entities/Notification';

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

export interface IGetNotificationsUseCase {
    execute(input: GetNotificationsInput): Promise<GetNotificationsOutput>;
}

export interface IMarkNotificationReadUseCase {
    execute(input: MarkNotificationReadInput): Promise<MarkNotificationReadOutput>;
}
