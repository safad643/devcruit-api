export interface ExecutionResult {
    output: string;
    error?: string;
    executionTimeMs: number;
}

export interface ICodeExecutionService {
    executeCode(language: string, code: string): Promise<ExecutionResult>;
}
