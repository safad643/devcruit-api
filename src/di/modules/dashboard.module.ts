// src/di/modules/dashboard.module.ts
import { ContainerModule } from 'inversify';
import { TYPES } from '../types';
import { GetCompanyDashboardUseCase } from '../../application/use-cases/dashboard/GetCompanyDashboardUseCase';
import { GetAdminDashboardUseCase } from '../../application/use-cases/dashboard/GetAdminDashboardUseCase';
import { DashboardController } from '../../presentation/controllers/DashboardController';
import { IGetCompanyDashboardUseCase, IGetAdminDashboardUseCase } from '../../application/use-cases/dashboard/interfaces';

export const dashboardModule = new ContainerModule((bind) => {
    bind<IGetCompanyDashboardUseCase>(TYPES.GetCompanyDashboardUseCase).to(GetCompanyDashboardUseCase);
    bind<IGetAdminDashboardUseCase>(TYPES.GetAdminDashboardUseCase).to(GetAdminDashboardUseCase);
    bind<DashboardController>(TYPES.DashboardController).to(DashboardController);
});

