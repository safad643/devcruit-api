import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobFieldRepository } from '../../../domain/repositories/IJobFieldRepository';
import { IUpdateJobFieldUseCase } from './interfaces';
import { UpdateJobFieldInput, UpdateJobFieldOutput } from '../../dtos/jobField.dto';
import { NotFoundError, ValidationError } from '../../../domain/errors';

@injectable()
export class UpdateJobFieldUseCase implements IUpdateJobFieldUseCase {
    constructor(
        @inject(TYPES.JobFieldRepository) private _jobFieldRepository: IJobFieldRepository
    ) { }

    async execute(input: UpdateJobFieldInput): Promise<UpdateJobFieldOutput> {
        // Find the field
        const existing = await this._jobFieldRepository.findById(input.id);
        if (!existing) {
            throw new NotFoundError('Job field not found');
        }

        // Check for duplicate name within the same type
        const duplicate = await this._jobFieldRepository.findByTypeAndName(existing.type, input.name.trim());
        if (duplicate && duplicate.id !== input.id) {
            throw new ValidationError(`${existing.type} "${input.name}" already exists`);
        }

        // Update the field
        const updated = await this._jobFieldRepository.update(input.id, { name: input.name.trim() });

        return {
            id: updated.id,
            type: updated.type,
            name: updated.name,
            message: `${updated.type} updated successfully`,
        };
    }
}
