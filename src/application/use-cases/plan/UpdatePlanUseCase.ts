import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPlanRepository } from '../../../domain/repositories/IPlanRepository';
import { IUpdatePlanUseCase } from './interfaces';
import { UpdatePlanInput, UpdatePlanOutput } from '../../dtos/plan.dto';
import { NotFoundError, ValidationError } from '../../../domain/errors';

@injectable()
export class UpdatePlanUseCase implements IUpdatePlanUseCase {
    constructor(
        @inject(TYPES.PlanRepository) private _planRepository: IPlanRepository
    ) { }

    async execute(id: string, input: UpdatePlanInput): Promise<UpdatePlanOutput> {
        // Find existing plan
        const existing = await this._planRepository.findById(id);
        if (!existing) {
            throw new NotFoundError('Plan not found');
        }

        // Validate offer fields if updating to offer mode
        const isOffer = input.isOffer ?? existing.isOffer;
        if (isOffer) {
            const discountType = input.discountType ?? existing.discountType;
            const discountValue = input.discountValue ?? existing.discountValue;

            if (!discountType || discountValue === undefined) {
                throw new ValidationError('Offer plans must have discountType and discountValue');
            }
            if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
                throw new ValidationError('Percentage discount must be between 0 and 100');
            }
            if (discountValue < 0) {
                throw new ValidationError('Discount value cannot be negative');
            }
        }

        // Build update data
        const updateData: UpdatePlanInput = {};
        if (input.name !== undefined) updateData.name = input.name.trim();
        if (input.description !== undefined) updateData.description = input.description.trim();
        if (input.price !== undefined) updateData.price = input.price;
        if (input.currency !== undefined) updateData.currency = input.currency;
        if (input.durationMonths !== undefined) updateData.durationMonths = input.durationMonths;
        if (input.limits !== undefined) updateData.limits = input.limits;
        if (input.features !== undefined) updateData.features = input.features;
        if (input.displayOrder !== undefined) updateData.displayOrder = input.displayOrder;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.isOffer !== undefined) updateData.isOffer = input.isOffer;
        if (input.offerLabel !== undefined) updateData.offerLabel = input.offerLabel?.trim();
        if (input.discountType !== undefined) updateData.discountType = input.discountType;
        if (input.discountValue !== undefined) updateData.discountValue = input.discountValue;

        const updated = await this._planRepository.update(id, updateData);

        return {
            id: updated.id,
            name: updated.name,
            message: 'Plan updated successfully',
        };
    }
}
