import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPlanRepository } from '../../../domain/repositories/IPlanRepository';
import { IListPlansUseCase } from './interfaces';
import { ListPlansInput, ListPlansOutput, PlanListItem } from '../../dtos/plan.dto';

@injectable()
export class ListPlansUseCase implements IListPlansUseCase {
    constructor(
        @inject(TYPES.PlanRepository) private _planRepository: IPlanRepository
    ) { }

    async execute(input: ListPlansInput): Promise<ListPlansOutput> {
        const { activeOnly, page = 1, limit = 10 } = input;

        let plans;
        let total;

        if (activeOnly) {
            // Active only returns all (non-paginated for public pricing page)
            plans = await this._planRepository.findActive();
            total = plans.length;
        } else {
            // Admin view: paginated
            plans = await this._planRepository.findAllPaginated(page, limit);
            total = await this._planRepository.countAll();
        }

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

        const totalPages = activeOnly ? 1 : Math.ceil(total / limit);

        return {
            plans: planItems,
            total,
            page: activeOnly ? 1 : page,
            limit: activeOnly ? total : limit,
            totalPages,
        };
    }
}
