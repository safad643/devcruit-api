import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { IExecuteCodeUseCase } from '../../application/use-cases/code-execution/interfaces';
import { ExecuteCodeInput } from '../schemas/code-execution.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class CodeExecutionController {
    constructor(
        @inject(TYPES.ExecuteCodeUseCase) private _executeCodeUseCase: IExecuteCodeUseCase,
    ) { }

    execute = async (
        request: FastifyRequest<{ Body: ExecuteCodeInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const { language, code } = request.body;

        const result = await this._executeCodeUseCase.execute({ language, code });

        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };
}
