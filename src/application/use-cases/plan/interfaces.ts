import {
    CreatePlanInput,
    CreatePlanOutput,
    UpdatePlanInput,
    UpdatePlanOutput,
    DeletePlanOutput,
    ListPlansInput,
    ListPlansOutput,
    GetPlanByIdOutput,
} from '../../dtos/plan.dto';

export interface ICreatePlanUseCase {
    execute(input: CreatePlanInput): Promise<CreatePlanOutput>;
}

export interface IUpdatePlanUseCase {
    execute(id: string, input: UpdatePlanInput): Promise<UpdatePlanOutput>;
}

export interface IDeletePlanUseCase {
    execute(id: string): Promise<DeletePlanOutput>;
}

export interface IListPlansUseCase {
    execute(input: ListPlansInput): Promise<ListPlansOutput>;
}

export interface IGetPlanByIdUseCase {
    execute(id: string): Promise<GetPlanByIdOutput>;
}
