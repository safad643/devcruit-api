import { IJobRepository, IUserRepository, IJobFieldRepository, ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { NotFoundError, ValidationError, PlanLimitError } from '../../../domain/errors';
import { Job, Compensation } from '../../../domain/entities/Job';
import { ICreateJobUseCase } from './interfaces';
import { CreateJobInput, CreateJobOutput, CreateJobCompensationInput } from '../../dtos/job.dto';

@injectable()
export class CreateJobUseCase implements ICreateJobUseCase {
  constructor(
    @inject(TYPES.JobRepository) private jobRepository: IJobRepository,
    @inject(TYPES.UserRepository) private userRepository: IUserRepository,
    @inject(TYPES.JobFieldRepository) private jobFieldRepository: IJobFieldRepository,
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
  ) { }

  /**
   * Type guard to check if compensation is a range type
   */
  private isRangeCompensation(compensation: CreateJobCompensationInput): compensation is { min: number; max: number; currency: string } {
    return (
      typeof compensation === 'object' &&
      compensation !== null &&
      'min' in compensation &&
      'max' in compensation &&
      'currency' in compensation &&
      typeof (compensation as { min?: unknown }).min === 'number' &&
      typeof (compensation as { max?: unknown }).max === 'number' &&
      typeof (compensation as { currency?: unknown }).currency === 'string'
    );
  }

  /**
   * Transform input compensation to domain compensation format
   */
  private transformCompensation(inputCompensation: CreateJobCompensationInput): Compensation {
    if (this.isRangeCompensation(inputCompensation)) {
      return {
        mode: 'range',
        min: inputCompensation.min,
        max: inputCompensation.max,
        currency: inputCompensation.currency,
      };
    }
    return {
      mode: 'hidden',
    };
  }

  async execute(input: CreateJobInput): Promise<CreateJobOutput> {
    // 1. Verify user exists
    const user = await this.userRepository.findById(input.companyId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // 2. Check if user is a company
    if (user.role !== 'company') {
      throw new ValidationError('Only company users can create jobs');
    }

    // 2.5 Check plan limits for active jobs (only for 'open' status)
    if (input.status === 'open') {
      const companyProfile = await this.companyProfileRepository.findByUserId(user.id);
      const currentPlan = companyProfile?.getCurrentPlan();
      if (currentPlan && currentPlan.limits.maxActiveJobs !== null) {
        const activeJobCount = await this.jobRepository.countActiveByCompany(user.id);
        if (activeJobCount >= currentPlan.limits.maxActiveJobs) {
          throw new PlanLimitError('active jobs', currentPlan.limits.maxActiveJobs);
        }
      }
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

    // 5. Validate compensation structure
    if (this.isRangeCompensation(input.compensation)) {
      const { min, max, currency } = input.compensation;
      if (min > max) {
        throw new ValidationError('Minimum salary cannot be greater than maximum salary');
      }
      if (!currency || currency.trim().length === 0) {
        throw new ValidationError('Currency is required for range compensation');
      }
    }

    // 6. Validate validUntil date is in the future
    const validUntilDate = new Date(input.validUntil);
    if (validUntilDate <= new Date()) {
      throw new ValidationError('Valid until date must be in the future');
    }

    // 7. Validate job fields (category, tech, skills) exist in database
    const missingCategory = await this.jobFieldRepository.findMissingNames('category', [input.category]);
    if (missingCategory.length > 0) {
      throw new ValidationError(`Invalid category: ${input.category}`);
    }

    const missingTech = await this.jobFieldRepository.findMissingNames('tech', input.requiredTech);
    if (missingTech.length > 0) {
      throw new ValidationError(`Invalid tech: ${missingTech.join(', ')}`);
    }

    const missingSkills = await this.jobFieldRepository.findMissingNames('skill', input.requiredSkills);
    if (missingSkills.length > 0) {
      throw new ValidationError(`Invalid skills: ${missingSkills.join(', ')}`);
    }

    // 8. Transform compensation to domain format
    const domainCompensation = this.transformCompensation(input.compensation);

    // 8. Create the job using the domain factory method
    const jobDataWithDefaults = Job.create({
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
      compensation: domainCompensation,
      benefits: input.benefits,
      validUntil: validUntilDate,
      autoShortlist: input.autoShortlist,
    });

    // Extract only the fields needed by the repository (omit createdAt, updatedAt as repository sets them)
    // and override status from input (Job.create defaults to 'draft')
    const { createdAt, updatedAt, ...jobDataWithoutTimestamps } = jobDataWithDefaults;
    const jobDataForRepository = {
      ...jobDataWithoutTimestamps,
      status: input.status,
    };

    // 9. Save to database
    const createdJob = await this.jobRepository.create(jobDataForRepository);

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

