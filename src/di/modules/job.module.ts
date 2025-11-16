import { ContainerModule } from 'inversify';
import { TYPES } from '../types';
import { CreateJobUseCase } from '../../application/use-cases/job/CreateJobUseCase';
import { ListJobsUseCase } from '../../application/use-cases/job/ListJobsUseCase';
import { DeleteJobUseCase } from '../../application/use-cases/job/DeleteJobUseCase';
import { CloseJobUseCase } from '../../application/use-cases/job/CloseJobUseCase';
import { OpenJobUseCase } from '../../application/use-cases/job/OpenJobUseCase';
import { UpdateJobUseCase } from '../../application/use-cases/job/UpdateJobUseCase';
import { GetJobUseCase } from '../../application/use-cases/job/GetJobUseCase';
import { JobController } from '../../presentation/controllers/JobController';
import { PublicListJobsUseCase } from '../../application/use-cases/job/PublicListJobsUseCase';
import { PublicGetJobUseCase } from '../../application/use-cases/job/PublicGetJobUseCase';
import { PublicJobController } from '../../presentation/controllers/PublicJobController';
import {
  ICreateJobUseCase,
  IListJobsUseCase,
  IDeleteJobUseCase,
  ICloseJobUseCase,
  IOpenJobUseCase,
  IUpdateJobUseCase,
  IGetJobUseCase,
  IPublicListJobsUseCase,
  IPublicGetJobUseCase
} from '../../application/use-cases/job/interfaces';

export const jobModule = new ContainerModule((bind) => {
  bind<ICreateJobUseCase>(TYPES.CreateJobUseCase).to(CreateJobUseCase);
  bind<IListJobsUseCase>(TYPES.ListJobsUseCase).to(ListJobsUseCase);
  bind<IDeleteJobUseCase>(TYPES.DeleteJobUseCase).to(DeleteJobUseCase);
  bind<ICloseJobUseCase>(TYPES.CloseJobUseCase).to(CloseJobUseCase);
  bind<IOpenJobUseCase>(TYPES.OpenJobUseCase).to(OpenJobUseCase);
  bind<IUpdateJobUseCase>(TYPES.UpdateJobUseCase).to(UpdateJobUseCase);
  bind<IGetJobUseCase>(TYPES.GetJobUseCase).to(GetJobUseCase);
  bind<IPublicListJobsUseCase>(TYPES.PublicListJobsUseCase).to(PublicListJobsUseCase);
  bind<IPublicGetJobUseCase>(TYPES.PublicGetJobUseCase).to(PublicGetJobUseCase);
  bind<JobController>(TYPES.JobController).to(JobController);
  bind<PublicJobController>(TYPES.PublicJobController).to(PublicJobController);
});

