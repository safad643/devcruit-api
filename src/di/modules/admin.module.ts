import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import {
  BlockUserUseCase,
  UnblockUserUseCase,
  ApproveCompanyUseCase,
  RejectCompanyUseCase
} from '../../application/use-cases/admin';
import { AdminController } from '../../presentation/controllers/AdminController';

export const adminModule = new ContainerModule((bind) => {
  bind<BlockUserUseCase>(TYPES.BlockUserUseCase).to(BlockUserUseCase);
  bind<UnblockUserUseCase>(TYPES.UnblockUserUseCase).to(UnblockUserUseCase);
  bind<ApproveCompanyUseCase>(TYPES.ApproveCompanyUseCase).to(ApproveCompanyUseCase);
  bind<RejectCompanyUseCase>(TYPES.RejectCompanyUseCase).to(RejectCompanyUseCase);

  // Controllers
  bind<AdminController>(TYPES.AdminController).to(AdminController);
});

