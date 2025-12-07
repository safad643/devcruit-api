import {
    CreateJobFieldInput,
    CreateJobFieldOutput,
    GetJobFieldsInput,
    GetJobFieldsOutput,
    UpdateJobFieldInput,
    UpdateJobFieldOutput,
    DeleteJobFieldInput,
    DeleteJobFieldOutput,
} from '../../dtos/jobField.dto';

export interface ICreateJobFieldUseCase {
    execute(input: CreateJobFieldInput): Promise<CreateJobFieldOutput>;
}

export interface IGetJobFieldsUseCase {
    execute(input: GetJobFieldsInput): Promise<GetJobFieldsOutput>;
}

export interface IUpdateJobFieldUseCase {
    execute(input: UpdateJobFieldInput): Promise<UpdateJobFieldOutput>;
}

export interface IDeleteJobFieldUseCase {
    execute(input: DeleteJobFieldInput): Promise<DeleteJobFieldOutput>;
}
