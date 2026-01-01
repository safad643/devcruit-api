import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ICodeExecutionService, ExecutionResult } from '../../services/ICodeExecutionService';
import { IExecuteCodeUseCase, ExecuteCodeInput } from './interfaces';

@injectable()
export class ExecuteCodeUseCase implements IExecuteCodeUseCase {
    constructor(
        @inject(TYPES.CodeExecutionService) private readonly _codeExecutionService: ICodeExecutionService,
    ) { }

    async execute(input: ExecuteCodeInput): Promise<ExecutionResult> {
        return this._codeExecutionService.executeCode(input.language, input.code);
    }
}
