import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobRepository, IApplicationRepository } from '../../../domain/repositories';
import { ForbiddenError, NotFoundError, ValidationError } from '../../../domain/errors';
import { JobProps } from '../../../domain/entities/Job';
import { IUpdateJobUseCase } from './interfaces';

@injectable()
export class UpdateJobUseCase implements IUpdateJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.ApplicationRepository) private applicationRepository: IApplicationRepository
  ) {}

  async execute(input: {
    jobId: string;
    companyId: string;
    updates: Partial<Omit<JobProps, 'id' | 'companyId' | 'createdAt' | 'updatedAt' | 'status'>>;
  }): Promise<{ id: string; message: string }> {
    const job = await this.jobRepository.findById(input.jobId);
    if (!job) throw new NotFoundError('Job not found');
    if (job.companyId !== input.companyId) throw new ForbiddenError('You do not have permission to edit this job');

    // Check if job has any applications - if so, prevent editing
    const applications = await this.applicationRepository.findByJobId(input.jobId);
    if (applications.length > 0) {
      throw new ValidationError('A job cannot be edited if someone has already applied to it');
    }

    const updates: Partial<JobProps> = {};

    // Handle all fields - now all fields are editable
    if (input.updates.title !== undefined) {
      updates.title = input.updates.title;
    }
    if (input.updates.description !== undefined) {
      updates.description = input.updates.description;
    }
    if (input.updates.category !== undefined) {
      updates.category = input.updates.category;
    }
    if (input.updates.requiredTech !== undefined) {
      updates.requiredTech = input.updates.requiredTech;
    }
    if (input.updates.requiredSkills !== undefined) {
      updates.requiredSkills = input.updates.requiredSkills;
    }
    if (input.updates.experienceLevel !== undefined) {
      updates.experienceLevel = input.updates.experienceLevel;
    }
    if (input.updates.minYears !== undefined) {
      updates.minYears = input.updates.minYears;
    }
    if (input.updates.niceTech !== undefined) {
      updates.niceTech = input.updates.niceTech;
    }
    if (input.updates.niceSkills !== undefined) {
      updates.niceSkills = input.updates.niceSkills;
    }
    if (input.updates.interviewRounds !== undefined) {
      updates.interviewRounds = input.updates.interviewRounds;
    }
    if (input.updates.jobType !== undefined) {
      updates.jobType = input.updates.jobType;
    }
    if (input.updates.workArrangement !== undefined) {
      updates.workArrangement = input.updates.workArrangement;
    }
    if (input.updates.location !== undefined) {
      updates.location = input.updates.location;
    }
    if (input.updates.relocation !== undefined) {
      updates.relocation = input.updates.relocation;
    }
    if (input.updates.compensation !== undefined) {
      updates.compensation = input.updates.compensation;
    }
    if (input.updates.benefits !== undefined) {
      updates.benefits = input.updates.benefits;
    }
    if (input.updates.validUntil !== undefined) {
      const newDate = input.updates.validUntil instanceof Date ? input.updates.validUntil : new Date(input.updates.validUntil);
      updates.validUntil = newDate;
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


