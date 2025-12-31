import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import { INotificationRepository } from '../../domain/repositories/INotificationRepository';
import { NotificationRepository } from '../../infrastructure/database/mongodb/NotificationRepository';

import { INotificationPusher } from '../../application/services/INotificationPusher';
import { SocketNotificationPusher } from '../../infrastructure/socket/SocketNotificationPusher';

import { INotificationService } from '../../application/services/INotificationService';
import { NotificationService } from '../../application/services/NotificationService';

import {
    IGetNotificationsUseCase,
    IMarkNotificationReadUseCase,
} from '../../application/use-cases/notification/interfaces';
import { GetNotificationsUseCase } from '../../application/use-cases/notification/GetNotificationsUseCase';
import { MarkNotificationReadUseCase } from '../../application/use-cases/notification/MarkNotificationReadUseCase';

import { NotificationController } from '../../presentation/controllers/NotificationController';

export const notificationModule = new ContainerModule((bind) => {
    // Repository
    bind<INotificationRepository>(TYPES.NotificationRepository)
        .to(NotificationRepository)
        .inSingletonScope();

    // Pusher service
    bind<INotificationPusher>(TYPES.NotificationPusher)
        .to(SocketNotificationPusher)
        .inSingletonScope();

    // Notification service
    bind<INotificationService>(TYPES.NotificationService)
        .to(NotificationService)
        .inSingletonScope();

    // Use cases
    bind<IGetNotificationsUseCase>(TYPES.GetNotificationsUseCase)
        .to(GetNotificationsUseCase)
        .inSingletonScope();

    bind<IMarkNotificationReadUseCase>(TYPES.MarkNotificationReadUseCase)
        .to(MarkNotificationReadUseCase)
        .inSingletonScope();

    // Controller
    bind<NotificationController>(TYPES.NotificationController)
        .to(NotificationController)
        .inSingletonScope();
});
