import { ListJobsInput, ListJobsOutput } from '../../../dtos/job.dto';

export interface IListJobsUseCase {
  execute(input: ListJobsInput & { companyId: string }): Promise<ListJobsOutput>;
}

