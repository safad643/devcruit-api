// src/application/use-cases/dashboard/GetDeveloperDashboardUseCase.ts
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IApplicationRepository, IDeveloperProfileRepository } from '../../../domain/repositories';
import { IGetDeveloperDashboardUseCase } from './interfaces';
import {
    DeveloperDashboardOutput,
    ApplicationStatusCounts
} from '../../dtos/dashboard.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class GetDeveloperDashboardUseCase implements IGetDeveloperDashboardUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository
    ) { }

    async execute(developerId: string): Promise<DeveloperDashboardOutput> {
        // Get developer profile to use profile ID (not userId)
        const developerProfile = await this._developerProfileRepository.findByUserId(developerId);
        if (!developerProfile) {
            throw new NotFoundError('Developer profile not found');
        }

        const profileId = developerProfile.id;

        // Fetch all data in parallel
        const [
            statusCounts,
            upcomingInterviews,
            recentApplications
        ] = await Promise.all([
            this._applicationRepository.getStatusCountsByDeveloper(profileId),
            this._applicationRepository.getUpcomingInterviewsForDeveloper(profileId, 3),
            this._applicationRepository.getRecentApplicationsForDeveloper(profileId, 5)
        ]);

        // Compute stats
        const activeStatuses = ['applied', 'shortlisted', 'interviewing', 'interview_completed'];
        const active = activeStatuses.reduce((sum, s) => sum + (statusCounts[s] || 0), 0);
        const offers = (statusCounts['offer_extended'] || 0) + (statusCounts['offer_accepted'] || 0);

        // Build byStatus object
        const byStatus: ApplicationStatusCounts = {
            applied: statusCounts['applied'] || 0,
            shortlisted: statusCounts['shortlisted'] || 0,
            interviewing: statusCounts['interviewing'] || 0,
            interview_completed: statusCounts['interview_completed'] || 0,
            offer_extended: statusCounts['offer_extended'] || 0,
            offer_accepted: statusCounts['offer_accepted'] || 0,
            offer_declined: statusCounts['offer_declined'] || 0,
            rejected: statusCounts['rejected'] || 0,
            withdrawn: statusCounts['withdrawn'] || 0
        };

        return {
            stats: {
                total: statusCounts['total'] || 0,
                active,
                offers,
                rejected: statusCounts['rejected'] || 0,
                pendingOffers: statusCounts['offer_extended'] || 0
            },
            byStatus,
            upcomingInterviews,
            recentApplications
        };
    }
}

