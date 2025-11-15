import { 
  IApplicationRepository,
  IDeveloperProfileRepository
} from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ForbiddenError, ValidationError } from '../../../domain/errors';
import { WithdrawApplicationInput, WithdrawApplicationOutput } from '../../dtos/application.dto';
import { ApplicationStatus } from '../../../domain/entities/Application';

@injectable()
export class WithdrawApplicationUseCase {
  constructor(
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository,
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository
  ) {}

  async execute(input: WithdrawApplicationInput & { developerId: string }): Promise<WithdrawApplicationOutput> {
    // Get developer profile
    const developerProfile = await this.developerProfileRepository.findByUserId(input.developerId);
    if (!developerProfile) {
      throw new NotFoundError('Developer profile not found');
    }

    // Get application
    const application = await this.applicationRepository.findById(input.applicationId);
    if (!application) {
      throw new NotFoundError('Application not found');
    }

    // Verify the application belongs to the developer
    if (application.developerId !== developerProfile.id) {
      throw new ForbiddenError('You do not have permission to withdraw this application');
    }

    // Check if application can be withdrawn
    const withdrawableStatuses: ApplicationStatus[] = ['applied', 'shortlisted', 'interviewing'];
    if (!withdrawableStatuses.includes(application.status)) {
      throw new ValidationError(`Cannot withdraw application with status: ${application.status}`);
    }

    // Update application status to withdrawn
    const updatedApplication = await this.applicationRepository.update(input.applicationId, {
      status: 'withdrawn',
      lastUpdatedAt: new Date(),
    });

    return {
      id: updatedApplication.id,
      status: updatedApplication.status,
      message: 'Application withdrawn successfully',
    };
  }
}

