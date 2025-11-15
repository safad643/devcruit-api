import { ContainerModule } from 'inversify';
import { TYPES } from '../types';
import { CreateApplicationUseCase } from '../../application/use-cases/application/CreateApplicationUseCase';
import { ListApplicationsForCompanyUseCase } from '../../application/use-cases/application/ListApplicationsForCompanyUseCase';
import { GetApplicationDetailsUseCase } from '../../application/use-cases/application/GetApplicationDetailsUseCase';
import { ListApplicationsForDeveloperUseCase } from '../../application/use-cases/application/ListApplicationsForDeveloperUseCase';
import { WithdrawApplicationUseCase } from '../../application/use-cases/application/WithdrawApplicationUseCase';
import { GetApplicationMetricsUseCase } from '../../application/use-cases/application/GetApplicationMetricsUseCase';
import { UpdateApplicationStatusUseCase } from '../../application/use-cases/application/UpdateApplicationStatusUseCase';
import { ApplicationController } from '../../presentation/controllers/ApplicationController';

export const applicationModule = new ContainerModule((bind) => {
  bind<CreateApplicationUseCase>(TYPES.CreateApplicationUseCase).to(CreateApplicationUseCase);
  bind<ListApplicationsForCompanyUseCase>(TYPES.ListApplicationsForCompanyUseCase).to(ListApplicationsForCompanyUseCase);
  bind<GetApplicationDetailsUseCase>(TYPES.GetApplicationDetailsUseCase).to(GetApplicationDetailsUseCase);
  bind<ListApplicationsForDeveloperUseCase>(TYPES.ListApplicationsForDeveloperUseCase).to(ListApplicationsForDeveloperUseCase);
  bind<WithdrawApplicationUseCase>(TYPES.WithdrawApplicationUseCase).to(WithdrawApplicationUseCase);
  bind<GetApplicationMetricsUseCase>(TYPES.GetApplicationMetricsUseCase).to(GetApplicationMetricsUseCase);
  bind<UpdateApplicationStatusUseCase>(TYPES.UpdateApplicationStatusUseCase).to(UpdateApplicationStatusUseCase);
  bind<ApplicationController>(TYPES.ApplicationController).to(ApplicationController);
});

