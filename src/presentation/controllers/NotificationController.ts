import { FastifyRequest, FastifyReply } from 'fastify';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../di/types';
import {
    IGetNotificationsUseCase,
    IMarkNotificationReadUseCase,
} from '../../application/use-cases/notification/interfaces';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { GetNotificationsQuery, NotificationIdParams } from '../schemas/notification.schema';

@injectable()
export class NotificationController {
    constructor(
        @inject(TYPES.GetNotificationsUseCase) private _getNotificationsUseCase: IGetNotificationsUseCase,
        @inject(TYPES.MarkNotificationReadUseCase) private _markNotificationReadUseCase: IMarkNotificationReadUseCase
    ) { }

    getNotifications = async (
        request: FastifyRequest<{ Querystring: GetNotificationsQuery }>,
        reply: FastifyReply
    ): Promise<void> => {
        const userId = request.user?.id as string;
        const result = await this._getNotificationsUseCase.execute({
            userId,
            limit: request.query.limit,
            offset: request.query.offset,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    getUnreadCount = async (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        const userId = request.user?.id as string;
        const result = await this._getNotificationsUseCase.execute({
            userId,
            limit: 0,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess({ unreadCount: result.unreadCount }));
    };

    markAsRead = async (
        request: FastifyRequest<{ Params: NotificationIdParams }>,
        reply: FastifyReply
    ): Promise<void> => {
        const userId = request.user?.id as string;
        const result = await this._markNotificationReadUseCase.execute({
            userId,
            notificationId: request.params.notificationId,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    markAllAsRead = async (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        const userId = request.user?.id as string;
        const result = await this._markNotificationReadUseCase.execute({
            userId,
            markAll: true,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };
}
