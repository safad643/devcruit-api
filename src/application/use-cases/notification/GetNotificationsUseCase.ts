import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { INotificationRepository } from '../../../domain/repositories/INotificationRepository';
import { IGetNotificationsUseCase, GetNotificationsInput, GetNotificationsOutput } from './interfaces';

@injectable()
export class GetNotificationsUseCase implements IGetNotificationsUseCase {
    constructor(
        @inject(TYPES.NotificationRepository) private _notificationRepository: INotificationRepository
    ) { }

    async execute(input: GetNotificationsInput): Promise<GetNotificationsOutput> {
        const [notifications, unreadCount] = await Promise.all([
            this._notificationRepository.findByUserId(
                input.userId,
                input.limit ?? 50,
                input.offset ?? 0
            ),
            this._notificationRepository.getUnreadCount(input.userId),
        ]);

        return {
            notifications,
            unreadCount,
        };
    }
}
