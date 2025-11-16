import { IJobRepository, IUserRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ValidationError } from '../../../domain/errors';
import { Job } from '../../../domain/entities/Job';
import { ICreateJobUseCase } from './interfaces';

@injectable()
export class CreateJobUseCase implements ICreateJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository
  ) {}

  async execute(input: {
    companyId: string;
    title: string;
    description: string;
    category: string;
    requiredTech: string[];
    requiredSkills: string[];
    interviewRounds: string[];
    experienceLevel: 'junior' | 'mid' | 'senior' | 'lead';
    minYears: number;
    niceTech: string[];
    niceSkills: string[];
    jobType: 'full-time' | 'part-time' | 'contract' | 'freelance';
    workArrangement: 'remote' | 'hybrid' | 'on-site';
    location?: string;
    relocation: boolean;
    compensation: {} | { min: number; max: number; currency: string };
    benefits?: string;
    validUntil: string;
    autoShortlist: boolean;
    status: 'draft' | 'open';
  }): Promise<{
    id: string;
    companyId: string;
    title: string;
    status: 'draft' | 'open' | 'closed';
    message: string;
  }> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(input.companyId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Check if user is a company
    if (user.role !== 'company') {
      throw new ValidationError('Only company users can create jobs');
    }

    // 3. Validate location is provided if workArrangement requires it
    if ((input.workArrangement === 'on-site' || input.workArrangement === 'hybrid') && !input.location) {
      throw new ValidationError('Location is required for on-site or hybrid work arrangements');
    }

    // 4. Validate interview rounds
    const interviewRounds = (input.interviewRounds || []).map(round => round.trim()).filter(round => round.length > 0);
    if (interviewRounds.length === 0) {
      throw new ValidationError('At least one interview round is required');
    }

    // 5. Validate compensation structure (inferred)
    const isRangeComp = (input.compensation as any).min !== undefined 
      || (input.compensation as any).max !== undefined 
      || (input.compensation as any).currency !== undefined;
    if (isRangeComp) {
      const { min, max, currency } = input.compensation as any;
      if (min === undefined || max === undefined) {
        throw new ValidationError('Minimum and maximum salary are required for range compensation');
      }
      if (min > max) {
        throw new ValidationError('Minimum salary cannot be greater than maximum salary');
      }
      if (!currency) {
        throw new ValidationError('Currency is required for range compensation');
      }
    }

    // 6. Validate validUntil date is in the future
    const validUntilDate = new Date(input.validUntil);
    if (validUntilDate <= new Date()) {
      throw new ValidationError('Valid until date must be in the future');
    }

    // 7. Create the job data with status from input
    const jobData = {
      companyId: input.companyId,
      title: input.title,
      description: input.description,
      category: input.category,
      requiredTech: input.requiredTech,
      requiredSkills: input.requiredSkills,
      interviewRounds,
      experienceLevel: input.experienceLevel,
      minYears: input.minYears,
      niceTech: input.niceTech,
      niceSkills: input.niceSkills,
      jobType: input.jobType,
      workArrangement: input.workArrangement,
      location: input.location,
      relocation: input.relocation,
      compensation: input.compensation,
      benefits: input.benefits,
      validUntil: validUntilDate,
      autoShortlist: input.autoShortlist,
      status: input.status,
    };

    // 8. Save to database
    const createdJob = await this.jobRepository.create(jobData);

    return {
      id: createdJob.id,
      companyId: createdJob.companyId,
      title: createdJob.title,
      status: createdJob.status,
      message: input.status === 'draft' 
        ? 'Job saved as draft successfully' 
        : 'Job posted successfully',
    };
  }
}

