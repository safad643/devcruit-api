import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
    ICreateJobFieldUseCase,
    IGetJobFieldsUseCase,
    IUpdateJobFieldUseCase,
    IDeleteJobFieldUseCase,
} from '../../application/use-cases/job-field/interfaces';
import {
    CreateJobFieldInput,
    GetJobFieldsInput,
    UpdateJobFieldInput,
    JobFieldIdParams,
} from '../schemas/jobField.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class JobFieldController {
    constructor(
        @inject(TYPES.CreateJobFieldUseCase) private _createJobFieldUseCase: ICreateJobFieldUseCase,
        @inject(TYPES.GetJobFieldsUseCase) private _getJobFieldsUseCase: IGetJobFieldsUseCase,
        @inject(TYPES.UpdateJobFieldUseCase) private _updateJobFieldUseCase: IUpdateJobFieldUseCase,
        @inject(TYPES.DeleteJobFieldUseCase) private _deleteJobFieldUseCase: IDeleteJobFieldUseCase
    ) { }

    create = async (
        request: FastifyRequest<{ Body: CreateJobFieldInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this._createJobFieldUseCase.execute(request.body);
        reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
    };

    getAll = async (
        request: FastifyRequest<{ Querystring: GetJobFieldsInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this._getJobFieldsUseCase.execute(request.query);
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    update = async (
        request: FastifyRequest<{ Params: JobFieldIdParams; Body: UpdateJobFieldInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this._updateJobFieldUseCase.execute({
            id: request.params.id,
            name: request.body.name,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    delete = async (
        request: FastifyRequest<{ Params: JobFieldIdParams }>,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this._deleteJobFieldUseCase.execute({ id: request.params.id });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };
}
