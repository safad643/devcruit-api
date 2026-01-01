import { ContainerModule } from 'inversify';
import { TYPES } from '../types';
import { ExecuteCodeUseCase } from '../../application/use-cases/code-execution/ExecuteCodeUseCase';
import { IExecuteCodeUseCase } from '../../application/use-cases/code-execution/interfaces';
import { CodeExecutionController } from '../../presentation/controllers/CodeExecutionController';

export const codeExecutionModule = new ContainerModule((bind) => {
    bind<IExecuteCodeUseCase>(TYPES.ExecuteCodeUseCase).to(ExecuteCodeUseCase);
    bind<CodeExecutionController>(TYPES.CodeExecutionController).to(CodeExecutionController);
});
