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
import { ScheduleInterviewRoundUseCase } from '../../application/use-cases/application/ScheduleInterviewRoundUseCase';
import { UpdateInterviewResultUseCase } from '../../application/use-cases/application/UpdateInterviewResultUseCase';
import { GetInterviewsForInterviewerUseCase } from '../../application/use-cases/application/GetInterviewsForInterviewerUseCase';
import { ExtendOfferUseCase } from '../../application/use-cases/application/ExtendOfferUseCase';
import { AcceptOfferUseCase } from '../../application/use-cases/application/AcceptOfferUseCase';
import { DeclineOfferUseCase } from '../../application/use-cases/application/DeclineOfferUseCase';
import { CreateOfferLetterUseCase } from '../../application/use-cases/offer-letter/CreateOfferLetterUseCase';
import { GetOfferLetterUseCase } from '../../application/use-cases/offer-letter/GetOfferLetterUseCase';
import { GetOrCreateVideoCallUseCase } from '../../application/use-cases/video-call/GetOrCreateVideoCallUseCase';
import { StartVideoCallUseCase } from '../../application/use-cases/video-call/StartVideoCallUseCase';
import { EndVideoCallUseCase } from '../../application/use-cases/video-call/EndVideoCallUseCase';
import { VideoCallHelper } from '../../application/use-cases/video-call/VideoCallHelper';
import { ApplicationController } from '../../presentation/controllers/ApplicationController';
import {
  ICreateApplicationUseCase,
  IListApplicationsForCompanyUseCase,
  IGetApplicationDetailsUseCase,
  IListApplicationsForDeveloperUseCase,
  IWithdrawApplicationUseCase,
  IGetApplicationMetricsUseCase,
  IShortlistApplicationUseCase,
  IRejectApplicationUseCase,
  IScheduleInterviewRoundUseCase,
  IUpdateInterviewResultUseCase,
  IGetInterviewsForInterviewerUseCase,
  IExtendOfferUseCase,
  IAcceptOfferUseCase,
  IDeclineOfferUseCase,
} from '../../application/use-cases/application/interfaces';
import {
  ICreateOfferLetterUseCase,
  IGetOfferLetterUseCase,
} from '../../application/use-cases/offer-letter/interfaces';
import {
  IGetOrCreateVideoCallUseCase,
  IStartVideoCallUseCase,
  IEndVideoCallUseCase
} from '../../application/use-cases/video-call/interfaces';

export const applicationModule = new ContainerModule((bind) => {
  bind<ICreateApplicationUseCase>(TYPES.CreateApplicationUseCase).to(CreateApplicationUseCase);
  bind<IListApplicationsForCompanyUseCase>(TYPES.ListApplicationsForCompanyUseCase).to(ListApplicationsForCompanyUseCase);
  bind<IGetApplicationDetailsUseCase>(TYPES.GetApplicationDetailsUseCase).to(GetApplicationDetailsUseCase);
  bind<IListApplicationsForDeveloperUseCase>(TYPES.ListApplicationsForDeveloperUseCase).to(ListApplicationsForDeveloperUseCase);
  bind<IWithdrawApplicationUseCase>(TYPES.WithdrawApplicationUseCase).to(WithdrawApplicationUseCase);
  bind<IGetApplicationMetricsUseCase>(TYPES.GetApplicationMetricsUseCase).to(GetApplicationMetricsUseCase);
  bind<IShortlistApplicationUseCase>(TYPES.ShortlistApplicationUseCase).to(ShortlistApplicationUseCase);
  bind<IRejectApplicationUseCase>(TYPES.RejectApplicationUseCase).to(RejectApplicationUseCase);
  bind<IScheduleInterviewRoundUseCase>(TYPES.ScheduleInterviewRoundUseCase).to(ScheduleInterviewRoundUseCase);
  bind<IUpdateInterviewResultUseCase>(TYPES.UpdateInterviewResultUseCase).to(UpdateInterviewResultUseCase);
  bind<IGetInterviewsForInterviewerUseCase>(TYPES.GetInterviewsForInterviewerUseCase).to(GetInterviewsForInterviewerUseCase);
  bind<IExtendOfferUseCase>(TYPES.ExtendOfferUseCase).to(ExtendOfferUseCase);
  bind<IAcceptOfferUseCase>(TYPES.AcceptOfferUseCase).to(AcceptOfferUseCase);
  bind<IDeclineOfferUseCase>(TYPES.DeclineOfferUseCase).to(DeclineOfferUseCase);
  bind<ICreateOfferLetterUseCase>(TYPES.CreateOfferLetterUseCase).to(CreateOfferLetterUseCase);
  bind<IGetOfferLetterUseCase>(TYPES.GetOfferLetterUseCase).to(GetOfferLetterUseCase);
  bind<VideoCallHelper>(TYPES.VideoCallHelper).to(VideoCallHelper);
  bind<IGetOrCreateVideoCallUseCase>(TYPES.GetOrCreateVideoCallUseCase).to(GetOrCreateVideoCallUseCase);
  bind<IStartVideoCallUseCase>(TYPES.StartVideoCallUseCase).to(StartVideoCallUseCase);
  bind<IEndVideoCallUseCase>(TYPES.EndVideoCallUseCase).to(EndVideoCallUseCase);
  bind<ApplicationController>(TYPES.ApplicationController).to(ApplicationController);
});
