import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
    ICreatePlanUseCase,
    IUpdatePlanUseCase,
    IDeletePlanUseCase,
    IListPlansUseCase,
    IGetPlanByIdUseCase,
} from '../../application/use-cases/plan/interfaces';
import {
    CreatePlanInput,
    UpdatePlanInput,
    PlanIdParams,
    ListPlansQuery,
} from '../schemas/plan.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class PlanController {
    constructor(
        @inject(TYPES.CreatePlanUseCase) private createPlanUseCase: ICreatePlanUseCase,
        @inject(TYPES.UpdatePlanUseCase) private updatePlanUseCase: IUpdatePlanUseCase,
        @inject(TYPES.DeletePlanUseCase) private deletePlanUseCase: IDeletePlanUseCase,
        @inject(TYPES.ListPlansUseCase) private listPlansUseCase: IListPlansUseCase,
        @inject(TYPES.GetPlanByIdUseCase) private getPlanByIdUseCase: IGetPlanByIdUseCase
    ) { }

    create = async (
        request: FastifyRequest<{ Body: CreatePlanInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this.createPlanUseCase.execute(request.body);
        reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
    };

    update = async (
        request: FastifyRequest<{ Params: PlanIdParams; Body: UpdatePlanInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this.updatePlanUseCase.execute(request.params.id, request.body);
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    delete = async (
        request: FastifyRequest<{ Params: PlanIdParams }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this.deletePlanUseCase.execute(request.params.id);
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    listAll = async (
        _request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this.listPlansUseCase.execute(false); // All plans for admin
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    listActive = async (
        _request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this.listPlansUseCase.execute(true); // Active only for public
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    getById = async (
        request: FastifyRequest<{ Params: PlanIdParams }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this.getPlanByIdUseCase.execute(request.params.id);
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };
}
