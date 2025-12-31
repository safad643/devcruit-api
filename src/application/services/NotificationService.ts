import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { INotificationPusher } from './INotificationPusher';
import { Notification } from '../../domain/entities/Notification';
import { INotificationService, CreateNotificationInput, CreateNotificationOutput } from './INotificationService';

@injectable()
export class NotificationService implements INotificationService {
    constructor(
        @inject(TYPES.NotificationRepository) private _notificationRepository: INotificationRepository,
        @inject(TYPES.NotificationPusher) private _notificationPusher: INotificationPusher
    ) { }

    async create(input: CreateNotificationInput): Promise<CreateNotificationOutput> {
        // Create notification data
        const notificationData = Notification.create({
            userId: input.userId,
            type: input.type,
            title: input.title,
            message: input.message,
            data: input.data,
        });

        // Save to database
        const notification = await this._notificationRepository.create(notificationData);

        // Push to connected user via socket
        this._notificationPusher.push(input.userId, notification);

        return { notification };
    }
}
