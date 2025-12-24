import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPlanRepository } from '../../../domain/repositories/IPlanRepository';
import { ICreatePlanUseCase } from './interfaces';
import { CreatePlanInput, CreatePlanOutput } from '../../dtos/plan.dto';
import { Plan } from '../../../domain/entities/Plan';
import { ValidationError } from '../../../domain/errors';

@injectable()
export class CreatePlanUseCase implements ICreatePlanUseCase {
    constructor(
        @inject(TYPES.PlanRepository) private planRepository: IPlanRepository
    ) { }

    async execute(input: CreatePlanInput): Promise<CreatePlanOutput> {
        // Validate offer fields
        if (input.isOffer) {
            if (!input.discountType || input.discountValue === undefined) {
                throw new ValidationError('Offer plans must have discountType and discountValue');
            }
            if (input.discountType === 'percentage' && (input.discountValue < 0 || input.discountValue > 100)) {
                throw new ValidationError('Percentage discount must be between 0 and 100');
            }
            if (input.discountValue < 0) {
                throw new ValidationError('Discount value cannot be negative');
            }
        }

        // Create the plan
        const planData = Plan.create({
            name: input.name.trim(),
            description: input.description.trim(),
            price: input.price,
            currency: input.currency,
            durationMonths: input.durationMonths,
            limits: input.limits,
            features: input.features,
            displayOrder: input.displayOrder,
            isOffer: input.isOffer,
            offerLabel: input.offerLabel?.trim(),
            discountType: input.discountType,
            discountValue: input.discountValue,
        });

        const created = await this.planRepository.create(planData);

        return {
            id: created.id,
            name: created.name,
            message: 'Plan created successfully',
        };
    }
}
