import { PublicListJobsInput, PublicListJobsOutput } from '../../../dtos/job.dto';

export interface IPublicListJobsUseCase {
  execute(input: PublicListJobsInput): Promise<PublicListJobsOutput>;
}

