import {
    CloseJobInput,
    CloseJobOutput,
    CreateJobInput,
    CreateJobOutput,
    DeleteJobInput,
    DeleteJobOutput,
    GetJobInput,
    ListJobsInput,
    ListJobsOutput,
    OpenJobInput,
    OpenJobOutput,
    PublicJobDetail,
    PublicListJobsInput,
    PublicListJobsOutput,
    UpdateJobInput,
    UpdateJobOutput,
} from '../../dtos/job.dto';
import { Job } from '../../../domain/entities/Job';

export interface ICreateJobUseCase {
    execute(input: CreateJobInput): Promise<CreateJobOutput>;
}

export interface IListJobsUseCase {
    execute(input: ListJobsInput & { companyId: string }): Promise<ListJobsOutput>;
}

export interface IDeleteJobUseCase {
    execute(input: DeleteJobInput): Promise<DeleteJobOutput>;
}

export interface ICloseJobUseCase {
    execute(input: CloseJobInput): Promise<CloseJobOutput>;
}

export interface IOpenJobUseCase {
    execute(input: OpenJobInput): Promise<OpenJobOutput>;
}

export interface IGetJobUseCase {
    execute(input: GetJobInput): Promise<Job>;
}

export interface IUpdateJobUseCase {
    execute(input: UpdateJobInput): Promise<UpdateJobOutput>;
}

export interface IPublicListJobsUseCase {
    execute(input: PublicListJobsInput): Promise<PublicListJobsOutput>;
}

export interface IPublicGetJobUseCase {
    execute(id: string): Promise<PublicJobDetail>;
}
