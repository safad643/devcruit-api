// src/application/use-cases/dashboard/interfaces.ts
import { CompanyDashboardOutput, AdminDashboardOutput, DeveloperDashboardOutput } from '../../dtos/dashboard.dto';

export interface IGetCompanyDashboardUseCase {
    execute(companyId: string): Promise<CompanyDashboardOutput>;
}

export interface IGetAdminDashboardUseCase {
    execute(): Promise<AdminDashboardOutput>;
}

export interface IGetDeveloperDashboardUseCase {
    execute(developerId: string): Promise<DeveloperDashboardOutput>;
}

