import {
    IApplicationRepository,
    IOfferLetterRepository,
    IDeveloperProfileRepository,
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError } from '../../../domain/errors';
import { GetOfferLetterOutput } from '../../dtos/offerLetter.dto';
import { IGetOfferLetterUseCase } from './interfaces';

@injectable()
export class GetOfferLetterUseCase implements IGetOfferLetterUseCase {
    constructor(
        @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
        @inject(TYPES.OfferLetterRepository) private _offerLetterRepository: IOfferLetterRepository,
        @inject(TYPES.DeveloperProfileRepository) private _developerProfileRepository: IDeveloperProfileRepository
    ) { }

    async execute(
        applicationId: string,
        userId: string,
        userRole: 'company' | 'developer'
    ): Promise<GetOfferLetterOutput> {
        // 1. Get application to verify access
        const application = await this._applicationRepository.findById(applicationId);
        if (!application) {
            throw new NotFoundError('Application not found');
        }

        // 2. Verify access based on role
        if (userRole === 'company' && application.companyId !== userId) {
            throw new ForbiddenError('You do not have access to this application');
        }

        // For developer, we need to look up their profile (developerId is profile ID, not user ID)
        if (userRole === 'developer') {
            const developerProfile = await this._developerProfileRepository.findByUserId(userId);
            if (!developerProfile || application.developerId !== developerProfile.id) {
                throw new ForbiddenError('You do not have access to this application');
            }
        }

        // 3. Get latest offer letter
        const offerLetter = await this._offerLetterRepository.findLatestByApplicationId(applicationId);
        if (!offerLetter) {
            throw new NotFoundError('No offer letter found for this application');
        }

        // 4. Return offer letter data (entity matches DTO shape)
        return offerLetter;
    }
}

