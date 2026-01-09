import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import {
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase,
  CreateCompanyProfileUseCase,
  GetCompanyProfileUseCase,
  UpdateDeveloperProfileUseCase,
  UpdateCompanyProfileUseCase,
  ResubmitDocumentsUseCase,
  InviteCompanyTeamMemberUseCase,
  ListCompanyTeamMembersUseCase,
  UpdateCompanyTeamMemberUseCase,
  DeleteCompanyTeamMemberUseCase
} from '../../application/use-cases/profile';
import { ProfileController } from '../../presentation/controllers/ProfileController';

export const profileModule = new ContainerModule((bind) => {
  bind<CreateDeveloperProfileUseCase>(TYPES.CreateDeveloperProfileUseCase).to(CreateDeveloperProfileUseCase);
  bind<GetDeveloperProfileUseCase>(TYPES.GetDeveloperProfileUseCase).to(GetDeveloperProfileUseCase);
  bind<CreateCompanyProfileUseCase>(TYPES.CreateCompanyProfileUseCase).to(CreateCompanyProfileUseCase);
  bind<GetCompanyProfileUseCase>(TYPES.GetCompanyProfileUseCase).to(GetCompanyProfileUseCase);
  bind<UpdateDeveloperProfileUseCase>(TYPES.UpdateDeveloperProfileUseCase).to(UpdateDeveloperProfileUseCase);
  bind<UpdateCompanyProfileUseCase>(TYPES.UpdateCompanyProfileUseCase).to(UpdateCompanyProfileUseCase);
  bind<ResubmitDocumentsUseCase>(TYPES.ResubmitDocumentsUseCase).to(ResubmitDocumentsUseCase);
  bind<InviteCompanyTeamMemberUseCase>(TYPES.InviteCompanyTeamMemberUseCase).to(InviteCompanyTeamMemberUseCase);
  bind<ListCompanyTeamMembersUseCase>(TYPES.ListCompanyTeamMembersUseCase).to(ListCompanyTeamMembersUseCase);
  bind<UpdateCompanyTeamMemberUseCase>(TYPES.UpdateCompanyTeamMemberUseCase).to(UpdateCompanyTeamMemberUseCase);
  bind<DeleteCompanyTeamMemberUseCase>(TYPES.DeleteCompanyTeamMemberUseCase).to(DeleteCompanyTeamMemberUseCase);

  // Controllers
  bind<ProfileController>(TYPES.ProfileController).to(ProfileController);
});

