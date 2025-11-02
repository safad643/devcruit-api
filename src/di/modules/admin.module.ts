import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import {
  BlockUserUseCase,
  UnblockUserUseCase,
  ApproveCompanyUseCase,
  RejectCompanyUseCase,
  ListCompaniesUseCase,
  ListDevelopersUseCase
} from '../../application/use-cases/admin';
import { AdminController } from '../../presentation/controllers/AdminController';

export const adminModule = new ContainerModule((bind) => {
  bind<BlockUserUseCase>(TYPES.BlockUserUseCase).to(BlockUserUseCase);
  bind<UnblockUserUseCase>(TYPES.UnblockUserUseCase).to(UnblockUserUseCase);
  bind<ApproveCompanyUseCase>(TYPES.ApproveCompanyUseCase).to(ApproveCompanyUseCase);
  bind<RejectCompanyUseCase>(TYPES.RejectCompanyUseCase).to(RejectCompanyUseCase);
  bind<ListCompaniesUseCase>(TYPES.ListCompaniesUseCase).to(ListCompaniesUseCase);
  bind<ListDevelopersUseCase>(TYPES.ListDevelopersUseCase).to(ListDevelopersUseCase);

  // Controllers
  bind<AdminController>(TYPES.AdminController).to(AdminController);
});

