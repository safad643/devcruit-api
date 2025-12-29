// src/application/use-cases/dashboard/GetAdminDashboardUseCase.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IUserRepository, ICompanyProfileRepository, IJobRepository, IApplicationRepository, IPaymentTransactionRepository, IJobFieldRepository, IPlanRepository } from '../../../domain/repositories';
import { IGetAdminDashboardUseCase } from './interfaces';
import { AdminDashboardOutput } from '../../dtos/dashboard.dto';

@injectable()
export class GetAdminDashboardUseCase implements IGetAdminDashboardUseCase {
    constructor(
        @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
        @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
        @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.PaymentTransactionRepository) private _paymentTransactionRepository: IPaymentTransactionRepository,
        @inject(TYPES.JobFieldRepository) private _jobFieldRepository: IJobFieldRepository,
        @inject(TYPES.PlanRepository) private _planRepository: IPlanRepository
    ) { }

    async execute(): Promise<AdminDashboardOutput> {
        // Fetch all data in parallel
        const [
            userStats,
            companyStatusCounts,
            signupTrend,
            revenueTrend,
            totalRevenue,
            pendingCompanies,
            jobsData,
            applicationsData,
            jobFieldsCount,
            plansCount
        ] = await Promise.all([
            this._userRepository.getUserStats(),
            this._companyProfileRepository.getStatusCounts(),
            this._userRepository.getSignupTrend(7),
            this._paymentTransactionRepository.getRevenueTrend(7),
            this._paymentTransactionRepository.getTotalRevenue(),
            this._companyProfileRepository.getPendingCompanies(5),
            this._getJobStats(),
            this._getApplicationCount(),
            this._getJobFieldsCount(),
            this._getActivePlansCount()
        ]);

        return {
            users: userStats,
            companyStatus: companyStatusCounts,
            platform: {
                totalJobs: jobsData.total,
                openJobs: jobsData.open,
                totalApplications: applicationsData,
                activePlans: plansCount,
                jobFields: jobFieldsCount
            },
            signupTrend,
            revenueTrend,
            pendingCompanies,
            totalRevenue
        };
    }

    private async _getJobStats(): Promise<{ total: number; open: number }> {
        // listPublicWithFilters only returns open jobs by default
        const result = await this._jobRepository.listPublicWithFilters({ page: 1, limit: 1 });
        return { total: result.total, open: result.total };
    }

    private async _getApplicationCount(): Promise<number> {
        const result = await this._applicationRepository.listWithFilters({ page: 1, limit: 1 });
        return result.total;
    }

    private async _getJobFieldsCount(): Promise<number> {
        // Count by fetching each type
        const [categories, techs, skills] = await Promise.all([
            this._jobFieldRepository.findAllByType('category'),
            this._jobFieldRepository.findAllByType('tech'),
            this._jobFieldRepository.findAllByType('skill')
        ]);
        return categories.length + techs.length + skills.length;
    }

    private async _getActivePlansCount(): Promise<number> {
        // Fetch all and filter
        const plans = await this._planRepository.findActive();
        return plans.length;
    }
}

