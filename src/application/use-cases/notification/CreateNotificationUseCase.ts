import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { INotificationPusher } from '../../services/INotificationPusher';
import { Notification } from '../../../domain/entities/Notification';
import { ICreateNotificationUseCase, CreateNotificationInput, CreateNotificationOutput } from './interfaces';

@injectable()
export class CreateNotificationUseCase implements ICreateNotificationUseCase {
    constructor(
        @inject(TYPES.NotificationRepository) private _notificationRepository: INotificationRepository,
        @inject(TYPES.NotificationPusher) private _notificationPusher: INotificationPusher
    ) { }

    async execute(input: CreateNotificationInput): Promise<CreateNotificationOutput> {
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
