import { ContainerModule } from 'inversify';
import { TYPES } from '../types';
import { CreateApplicationUseCase } from '../../application/use-cases/application/CreateApplicationUseCase';
import { ListApplicationsForCompanyUseCase } from '../../application/use-cases/application/ListApplicationsForCompanyUseCase';
import { GetApplicationDetailsUseCase } from '../../application/use-cases/application/GetApplicationDetailsUseCase';
import { ListApplicationsForDeveloperUseCase } from '../../application/use-cases/application/ListApplicationsForDeveloperUseCase';
import { WithdrawApplicationUseCase } from '../../application/use-cases/application/WithdrawApplicationUseCase';
import { GetApplicationMetricsUseCase } from '../../application/use-cases/application/GetApplicationMetricsUseCase';
import { ShortlistApplicationUseCase } from '../../application/use-cases/application/ShortlistApplicationUseCase';
import { RejectApplicationUseCase } from '../../application/use-cases/application/RejectApplicationUseCase';
import { ApplicationController } from '../../presentation/controllers/ApplicationController';
import {
  ICreateApplicationUseCase,
  IListApplicationsForCompanyUseCase,
  IGetApplicationDetailsUseCase,
  IListApplicationsForDeveloperUseCase,
  IWithdrawApplicationUseCase,
  IGetApplicationMetricsUseCase,
  IShortlistApplicationUseCase,
  IRejectApplicationUseCase
} from '../../application/use-cases/application/interfaces';

export const applicationModule = new ContainerModule((bind) => {
  bind<ICreateApplicationUseCase>(TYPES.CreateApplicationUseCase).to(CreateApplicationUseCase);
  bind<IListApplicationsForCompanyUseCase>(TYPES.ListApplicationsForCompanyUseCase).to(ListApplicationsForCompanyUseCase);
  bind<IGetApplicationDetailsUseCase>(TYPES.GetApplicationDetailsUseCase).to(GetApplicationDetailsUseCase);
  bind<IListApplicationsForDeveloperUseCase>(TYPES.ListApplicationsForDeveloperUseCase).to(ListApplicationsForDeveloperUseCase);
  bind<IWithdrawApplicationUseCase>(TYPES.WithdrawApplicationUseCase).to(WithdrawApplicationUseCase);
  bind<IGetApplicationMetricsUseCase>(TYPES.GetApplicationMetricsUseCase).to(GetApplicationMetricsUseCase);
  bind<IShortlistApplicationUseCase>(TYPES.ShortlistApplicationUseCase).to(ShortlistApplicationUseCase);
  bind<IRejectApplicationUseCase>(TYPES.RejectApplicationUseCase).to(RejectApplicationUseCase);
  bind<ApplicationController>(TYPES.ApplicationController).to(ApplicationController);
});

