import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobFieldRepository } from '../../../domain/repositories/IJobFieldRepository';
import { IDeleteJobFieldUseCase } from './interfaces';
import { DeleteJobFieldInput, DeleteJobFieldOutput } from '../../dtos/jobField.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class DeleteJobFieldUseCase implements IDeleteJobFieldUseCase {
    constructor(
        @inject(TYPES.JobFieldRepository) private _jobFieldRepository: IJobFieldRepository
    ) { }

    async execute(input: DeleteJobFieldInput): Promise<DeleteJobFieldOutput> {
        // Find the field to confirm it exists
        const existing = await this._jobFieldRepository.findById(input.id);
        if (!existing) {
            throw new NotFoundError('Job field not found');
        }

        // Delete it
        await this._jobFieldRepository.delete(input.id);

        return {
            id: input.id,
            message: `${existing.type} "${existing.name}" deleted successfully`,
        };
    }
}
