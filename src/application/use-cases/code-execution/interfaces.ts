import { ExecutionResult } from '../../services/ICodeExecutionService';

export interface ExecuteCodeInput {
    language: string;
    code: string;
}

export interface IExecuteCodeUseCase {
    execute(input: ExecuteCodeInput): Promise<ExecutionResult>;
}
