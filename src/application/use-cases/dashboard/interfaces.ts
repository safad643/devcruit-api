// src/application/use-cases/dashboard/interfaces.ts
import { CompanyDashboardOutput, AdminDashboardOutput } from '../../dtos/dashboard.dto';

export interface IGetCompanyDashboardUseCase {
    execute(companyId: string): Promise<CompanyDashboardOutput>;
}

export interface IGetAdminDashboardUseCase {
    execute(): Promise<AdminDashboardOutput>;
}

