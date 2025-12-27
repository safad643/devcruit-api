import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository, IApplicationRepository, IJobFieldRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { JobProps } from '../../../domain/entities/Job';
import { IUpdateJobUseCase } from './interfaces';
import { UpdateJobInput, UpdateJobOutput } from '../../dtos/job.dto';

@injectable()
export class UpdateJobUseCase implements IUpdateJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private _jobRepository: IJobRepository,
    @inject(TYPES.ApplicationRepository) private _applicationRepository: IApplicationRepository,
    @inject(TYPES.JobFieldRepository) private _jobFieldRepository: IJobFieldRepository
  ) { }

  async execute(input: UpdateJobInput): Promise<UpdateJobOutput> {
    const job = await this._jobRepository.findById(input.jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.companyId !== input.companyId) throw new ForbiddenError('You do not have permission to edit this job');

    // Check if job has any applications - if so, prevent editing
    const applications = await this._applicationRepository.findByJobId(input.jobId);
    if (applications.length > 0) {
      throw new ValidationError('A job cannot be edited if someone has already applied to it');
    }

    // Validate job fields if provided
    if (input.updates.category) {
      const missingCategory = await this._jobFieldRepository.findMissingNames('category', [input.updates.category]);
      if (missingCategory.length > 0) {
        throw new ValidationError(`Invalid category: ${input.updates.category}`);
      }
    }

    if (input.updates.requiredTech && input.updates.requiredTech.length > 0) {
      const missingTech = await this._jobFieldRepository.findMissingNames('tech', input.updates.requiredTech);
      if (missingTech.length > 0) {
        throw new ValidationError(`Invalid tech: ${missingTech.join(', ')}`);
      }
    }

    if (input.updates.requiredSkills && input.updates.requiredSkills.length > 0) {
      const missingSkills = await this._jobFieldRepository.findMissingNames('skill', input.updates.requiredSkills);
      if (missingSkills.length > 0) {
        throw new ValidationError(`Invalid skills: ${missingSkills.join(', ')}`);
      }
    }

    //Build updates object with proper types
    const updates: Partial<JobProps> = { ...input.updates } as Partial<JobProps>;

    // Convert validUntil from string to Date if provided
    if (input.updates.validUntil) {
      updates.validUntil = new Date(input.updates.validUntil);
    }

    const updated = await this._jobRepository.update(input.jobId, updates);
    return {
      id: updated.id,
      message: 'Job updated successfully'
    };
  }
}
