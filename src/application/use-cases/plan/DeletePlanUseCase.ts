import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPlanRepository } from '../../../domain/repositories/IPlanRepository';
import { IDeletePlanUseCase } from './interfaces';
import { DeletePlanOutput } from '../../dtos/plan.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class DeletePlanUseCase implements IDeletePlanUseCase {
    constructor(
        @inject(TYPES.PlanRepository) private planRepository: IPlanRepository
    ) { }

    async execute(id: string): Promise<DeletePlanOutput> {
        const existing = await this.planRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Plan not found');
        }

        await this.planRepository.delete(id);

        return {
            id,
            message: 'Plan deleted successfully',
        };
    }
}
