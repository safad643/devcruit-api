import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import { JobFieldRepository } from '../../infrastructure/database/mongodb/JobFieldRepository';
import { IJobFieldRepository } from '../../domain/repositories/IJobFieldRepository';
import {
    CreateJobFieldUseCase,
    GetJobFieldsUseCase,
    UpdateJobFieldUseCase,
    DeleteJobFieldUseCase,
} from '../../application/use-cases/job-field';
import { JobFieldController } from '../../presentation/controllers/JobFieldController';

export const jobFieldModule = new ContainerModule((bind) => {
    // Repository
    bind<IJobFieldRepository>(TYPES.JobFieldRepository).to(JobFieldRepository);

    // Use Cases
    bind<CreateJobFieldUseCase>(TYPES.CreateJobFieldUseCase).to(CreateJobFieldUseCase);
    bind<GetJobFieldsUseCase>(TYPES.GetJobFieldsUseCase).to(GetJobFieldsUseCase);
    bind<UpdateJobFieldUseCase>(TYPES.UpdateJobFieldUseCase).to(UpdateJobFieldUseCase);
    bind<DeleteJobFieldUseCase>(TYPES.DeleteJobFieldUseCase).to(DeleteJobFieldUseCase);

    // Controller
    bind<JobFieldController>(TYPES.JobFieldController).to(JobFieldController);
});
