import { injectable } from 'inversify';
import { Sandbox } from '@e2b/code-interpreter';
import { ICodeExecutionService, ExecutionResult } from '../../application/services/ICodeExecutionService';

// Language to E2B template mapping
const LANGUAGE_MAP: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    typescript: 'javascript', // TS transpiles to JS
    java: 'java',
    cpp: 'cpp',
    go: 'go',
};

@injectable()
export class E2BService implements ICodeExecutionService {
    async executeCode(language: string, code: string): Promise<ExecutionResult> {
        const startTime = Date.now();
        const lang = LANGUAGE_MAP[language.toLowerCase()] || 'python';

        let sandbox: Sandbox | null = null;

        try {
            sandbox = await Sandbox.create();

            const execution = await sandbox.runCode(code, { language: lang });

            const executionTimeMs = Date.now() - startTime;

            // Combine stdout and stderr
            const stdout = execution.logs.stdout.join('\n');
            const stderr = execution.logs.stderr.join('\n');

            if (execution.error) {
                return {
                    output: stdout,
                    error: execution.error.name || stderr,
                    executionTimeMs,
                };
            }

            return {
                output: stdout || 'No output',
                executionTimeMs,
            };
        } catch (error: any) {
            return {
                output: '',
                error: error.message || 'Execution failed',
                executionTimeMs: Date.now() - startTime,
            };
        } finally {
            if (sandbox) {
                await sandbox.kill().catch(() => { });
            }
        }
    }
}
