import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { IMarkNotificationReadUseCase, MarkNotificationReadInput, MarkNotificationReadOutput } from './interfaces';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';

@injectable()
export class MarkNotificationReadUseCase implements IMarkNotificationReadUseCase {
    constructor(
        @inject(TYPES.NotificationRepository) private _notificationRepository: INotificationRepository
    ) { }

    async execute(input: MarkNotificationReadInput): Promise<MarkNotificationReadOutput> {
        if (input.markAll) {
            // Mark all notifications as read for user
            await this._notificationRepository.markAllAsRead(input.userId);
            return { success: true };
        }

        if (!input.notificationId) {
            throw new ValidationError('Either notificationId or markAll must be provided');
        }

        // Verify notification belongs to user
        const notification = await this._notificationRepository.findById(input.notificationId);

        if (!notification) {
            throw new NotFoundError('Notification not found');
        }

        if (notification.userId !== input.userId) {
            throw new ForbiddenError('You do not have access to this notification');
        }

        await this._notificationRepository.markAsRead(input.notificationId);

        return { success: true };
    }
}
