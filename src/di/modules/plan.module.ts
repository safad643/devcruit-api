import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import { PlanRepository } from '../../infrastructure/database/mongodb/PlanRepository';
import { PaymentTransactionRepository } from '../../infrastructure/database/mongodb/PaymentTransactionRepository';
import { IPlanRepository } from '../../domain/repositories/IPlanRepository';
import { IPaymentTransactionRepository } from '../../domain/repositories/IPaymentTransactionRepository';
import {
    CreatePlanUseCase,
    UpdatePlanUseCase,
    DeletePlanUseCase,
    ListPlansUseCase,
    GetPlanByIdUseCase,
} from '../../application/use-cases/plan';
import { PlanController } from '../../presentation/controllers/PlanController';

export const planModule = new ContainerModule((bind) => {
    // Repositories
    bind<IPlanRepository>(TYPES.PlanRepository).to(PlanRepository).inSingletonScope();
    bind<IPaymentTransactionRepository>(TYPES.PaymentTransactionRepository).to(PaymentTransactionRepository).inSingletonScope();

    // Use Cases
    bind<CreatePlanUseCase>(TYPES.CreatePlanUseCase).to(CreatePlanUseCase);
    bind<UpdatePlanUseCase>(TYPES.UpdatePlanUseCase).to(UpdatePlanUseCase);
    bind<DeletePlanUseCase>(TYPES.DeletePlanUseCase).to(DeletePlanUseCase);
    bind<ListPlansUseCase>(TYPES.ListPlansUseCase).to(ListPlansUseCase);
    bind<GetPlanByIdUseCase>(TYPES.GetPlanByIdUseCase).to(GetPlanByIdUseCase);

    // Controller
    bind<PlanController>(TYPES.PlanController).to(PlanController);
});
