import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPlanRepository } from '../../../domain/repositories/IPlanRepository';
import { IListPlansUseCase } from './interfaces';
import { ListPlansOutput, PlanListItem } from '../../dtos/plan.dto';

@injectable()
export class ListPlansUseCase implements IListPlansUseCase {
    constructor(
        @inject(TYPES.PlanRepository) private planRepository: IPlanRepository
    ) { }

    async execute(activeOnly: boolean): Promise<ListPlansOutput> {
        const plans = activeOnly
            ? await this.planRepository.findActive()
            : await this.planRepository.findAll();

        const planItems: PlanListItem[] = plans.map(plan => ({
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
        }));

        return { plans: planItems };
    }
}
