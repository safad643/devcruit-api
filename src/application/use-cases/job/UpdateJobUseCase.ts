import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { JobProps } from '../../../domain/entities/Job';

interface UpdateJobInput {
  jobId: string;
  companyId: string;
  updates: Partial<Pick<JobProps, 'description' | 'benefits' | 'validUntil' | 'niceTech' | 'niceSkills' | 'autoShortlist'>>;
}

@injectable()
export class UpdateJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository
  ) {}

  async execute(input: UpdateJobInput) {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.companyId !== input.companyId) throw new ForbiddenError('You do not have permission to edit this job');

    const updates: Partial<JobProps> = {};

    if (input.updates.description !== undefined) {
      updates.description = input.updates.description;
    }
    if (input.updates.benefits !== undefined) {
      updates.benefits = input.updates.benefits;
    }
    if (input.updates.validUntil !== undefined) {
      const newDate = input.updates.validUntil instanceof Date ? input.updates.validUntil : new Date(input.updates.validUntil);
      if (newDate < job.validUntil) {
        throw new ValidationError('validUntil can only be extended (must be later than current deadline)');
      }
      updates.validUntil = newDate;
    }
    if (input.updates.niceTech !== undefined) {
      updates.niceTech = input.updates.niceTech;
    }
    if (input.updates.niceSkills !== undefined) {
      updates.niceSkills = input.updates.niceSkills;
    }
    if (input.updates.autoShortlist !== undefined) {
      updates.autoShortlist = input.updates.autoShortlist;
    }

    const updated = await this.jobRepository.update(input.jobId, updates);
    return {
      id: updated.id,
      message: 'Job updated successfully'
    };
  }
}


