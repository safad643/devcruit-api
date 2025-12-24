import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPlanRepository } from '../../../domain/repositories/IPlanRepository';
import { IGetPlanByIdUseCase } from './interfaces';
import { GetPlanByIdOutput } from '../../dtos/plan.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class GetPlanByIdUseCase implements IGetPlanByIdUseCase {
    constructor(
        @inject(TYPES.PlanRepository) private planRepository: IPlanRepository
    ) { }

    async execute(id: string): Promise<GetPlanByIdOutput> {
        const plan = await this.planRepository.findById(id);
        if (!plan) {
            throw new NotFoundError('Plan not found');
        }

        return {
            id: plan.id,
            name: plan.name,
            description: plan.description,
            price: plan.price,
            currency: plan.currency,
            durationMonths: plan.durationMonths,
            limits: plan.limits,
            features: plan.features,
            displayOrder: plan.displayOrder,
            isActive: plan.isActive,
            isOffer: plan.isOffer,
            offerLabel: plan.offerLabel,
            discountType: plan.discountType,
            discountValue: plan.discountValue,
            finalPrice: plan.getFinalPrice(),
        };
    }
}
