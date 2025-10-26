import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import { UploadFileUseCase, DeleteFileUseCase } from '../../application/use-cases/file';
import { FileController } from '../../presentation/controllers/FileController';

export const fileModule = new ContainerModule((bind) => {
  bind<UploadFileUseCase>(TYPES.UploadFileUseCase).to(UploadFileUseCase);
  bind<DeleteFileUseCase>(TYPES.DeleteFileUseCase).to(DeleteFileUseCase);

  // Controllers
  bind<FileController>(TYPES.FileController).to(FileController);
});
