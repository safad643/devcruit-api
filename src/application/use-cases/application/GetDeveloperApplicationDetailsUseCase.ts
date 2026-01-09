import {
    IApplicationRepository,
    IJobRepository,
    ICompanyProfileRepository,
    IDeveloperProfileRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { DeveloperApplicationDetailsOutput } from '../../dtos/application.dto';
import { IGetDeveloperApplicationDetailsUseCase } from './interfaces';

@injectable()
export class GetDeveloperApplicationDetailsUseCase implements IGetDeveloperApplicationDetailsUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
        @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
        @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository
    ) { }

    async execute(applicationId: string, developerId: string): Promise<DeveloperApplicationDetailsOutput> {
        // Get developer profile to get the profile ID
        const developerProfile = await this._developerProfileRepository.findByUserId(developerId);
        if (!developerProfile) {
            throw new NotFoundError('Developer profile not found');
        }

        // Get application
        const application = await this._applicationRepository.findById(applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        // Verify this application belongs to the developer
        if (application.developerId !== developerProfile.id) {
            throw new ForbiddenError('You do not have access to this application');
        }

        // Get job information
        const job = await this._jobRepository.findById(application.jobId);

        // Get company profile
        const companyProfile = await this._companyProfileRepository.findByUserId(application.companyId);

        return {
            id: application.id,
            jobId: application.jobId,
            companyId: application.companyId,
            status: application.status,
            shortlistMethod: application.shortlistMethod,
            statusNotes: application.statusNotes,
            appliedAt: application.appliedAt,
            lastUpdatedAt: application.lastUpdatedAt,
            rejectedAt: application.rejectedAt,
            rejectedAtStage: application.rejectedAtStage,
            interviewRounds: application.interviewRounds,
            counterOffer: application.counterOffer,
            job: job ? {
                id: job.id,
                title: job.title,
                interviewRounds: job.interviewRounds,
            } : undefined,
            company: companyProfile ? {
                id: companyProfile.id,
                companyName: companyProfile.companyName,
            } : undefined,
        };
    }
}
