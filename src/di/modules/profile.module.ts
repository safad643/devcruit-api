import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import {
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase,
  CreateCompanyProfileUseCase,
  GetCompanyProfileUseCase
} from '../../application/use-cases/profile';
import { ProfileController } from '../../presentation/controllers/ProfileController';

export const profileModule = new ContainerModule((bind) => {
  bind<CreateDeveloperProfileUseCase>(TYPES.CreateDeveloperProfileUseCase).to(CreateDeveloperProfileUseCase);
  bind<GetDeveloperProfileUseCase>(TYPES.GetDeveloperProfileUseCase).to(GetDeveloperProfileUseCase);
  bind<CreateCompanyProfileUseCase>(TYPES.CreateCompanyProfileUseCase).to(CreateCompanyProfileUseCase);
  bind<GetCompanyProfileUseCase>(TYPES.GetCompanyProfileUseCase).to(GetCompanyProfileUseCase);

  // Controllers
  bind<ProfileController>(TYPES.ProfileController).to(ProfileController);
});

