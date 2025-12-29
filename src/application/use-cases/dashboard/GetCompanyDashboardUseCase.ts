// src/application/use-cases/dashboard/GetCompanyDashboardUseCase.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository, IApplicationRepository, ICompanyTeamRepository } from '../../../domain/repositories';
import { IGetCompanyDashboardUseCase } from './interfaces';
import {
    CompanyDashboardOutput,
    JobStats,
    ApplicationStats,
    TeamStats,
    ApplicationStatusCounts
} from '../../dtos/dashboard.dto';

@injectable()
export class GetCompanyDashboardUseCase implements IGetCompanyDashboardUseCase {
    constructor(
        @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository
    ) { }

    async execute(companyId: string): Promise<CompanyDashboardOutput> {
        // Fetch all aggregated data in parallel - all work done in DB
        const [
            jobStatusCounts,
            applicationStatusCounts,
            teamStats,
            recentApplications,
            upcomingInterviews,
            applicationTrend
        ] = await Promise.all([
            this._jobRepository.getStatusCounts(companyId),
            this._applicationRepository.getStatusCountsByCompany(companyId),
            this._companyTeamRepository.getTeamStats(companyId),
            this._applicationRepository.getRecentWithDetails(companyId, 5),
            this._applicationRepository.getUpcomingInterviews(companyId, 5),
            this._applicationRepository.getApplicationTrend(companyId, 7),
        ]);

        // 1. Job Stats - already aggregated by DB
        const jobStats: JobStats = {
            open: jobStatusCounts.open,
            closed: jobStatusCounts.closed,
            draft: jobStatusCounts.draft,
            total: jobStatusCounts.total
        };

        // 2. Application Stats - already aggregated by DB
        const statusCounts: ApplicationStatusCounts = {
            applied: applicationStatusCounts.applied || 0,
            shortlisted: applicationStatusCounts.shortlisted || 0,
            interviewing: applicationStatusCounts.interviewing || 0,
            interview_completed: applicationStatusCounts.interview_completed || 0,
            offer_extended: applicationStatusCounts.offer_extended || 0,
            offer_accepted: applicationStatusCounts.offer_accepted || 0,
            offer_declined: applicationStatusCounts.offer_declined || 0,
            rejected: applicationStatusCounts.rejected || 0,
            withdrawn: applicationStatusCounts.withdrawn || 0
        };

        const applicationStats: ApplicationStats = {
            total: applicationStatusCounts.total || 0,
            byStatus: statusCounts
        };

        // 3. Team Stats - already aggregated by DB
        const teamStatsResult: TeamStats = {
            total: teamStats.total,
            hr: teamStats.hr,
            interviewers: teamStats.interviewers,
            active: teamStats.active,
            invited: teamStats.invited
        };

        return {
            jobs: jobStats,
            applications: applicationStats,
            team: teamStatsResult,
            recentApplications,
            upcomingInterviews,
            applicationTrend
        };
    }
}
