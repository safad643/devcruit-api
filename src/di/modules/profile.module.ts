import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import {
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase
} from '../../application/use-cases/profile';
import { ProfileController } from '../../presentation/controllers/ProfileController';

export const profileModule = new ContainerModule((bind) => {
  bind<CreateDeveloperProfileUseCase>(TYPES.CreateDeveloperProfileUseCase).to(CreateDeveloperProfileUseCase);
  bind<GetDeveloperProfileUseCase>(TYPES.GetDeveloperProfileUseCase).to(GetDeveloperProfileUseCase);

  // Controllers
  bind<ProfileController>(TYPES.ProfileController).to(ProfileController);
});

