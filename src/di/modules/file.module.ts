import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import { DeleteFileUseCase, GenerateSignatureUseCase } from '../../application/use-cases/file';
import { FileController } from '../../presentation/controllers/FileController';

export const fileModule = new ContainerModule((bind) => {
  bind<GenerateSignatureUseCase>(TYPES.GenerateSignatureUseCase).to(GenerateSignatureUseCase);
  bind<DeleteFileUseCase>(TYPES.DeleteFileUseCase).to(DeleteFileUseCase);

  // Controllers
  bind<FileController>(TYPES.FileController).to(FileController);
});
