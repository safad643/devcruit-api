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

export const jobModule = new ContainerModule((bind) => {
  bind<CreateJobUseCase>(TYPES.CreateJobUseCase).to(CreateJobUseCase);
  bind<ListJobsUseCase>(TYPES.ListJobsUseCase).to(ListJobsUseCase);
  bind<DeleteJobUseCase>(TYPES.DeleteJobUseCase).to(DeleteJobUseCase);
  bind<CloseJobUseCase>(TYPES.CloseJobUseCase).to(CloseJobUseCase);
  bind<OpenJobUseCase>(TYPES.OpenJobUseCase).to(OpenJobUseCase);
  bind<UpdateJobUseCase>(TYPES.UpdateJobUseCase).to(UpdateJobUseCase);
  bind<GetJobUseCase>(TYPES.GetJobUseCase).to(GetJobUseCase);
  bind<JobController>(TYPES.JobController).to(JobController);
  bind<PublicListJobsUseCase>(TYPES.PublicListJobsUseCase).to(PublicListJobsUseCase);
  bind<PublicGetJobUseCase>(TYPES.PublicGetJobUseCase).to(PublicGetJobUseCase);
  bind<PublicJobController>(TYPES.PublicJobController).to(PublicJobController);
});

