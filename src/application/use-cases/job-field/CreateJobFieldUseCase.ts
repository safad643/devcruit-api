import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobFieldRepository } from '../../../domain/repositories/IJobFieldRepository';
import { ICreateJobFieldUseCase } from './interfaces';
import { CreateJobFieldInput, CreateJobFieldOutput } from '../../dtos/jobField.dto';
import { JobField } from '../../../domain/entities/JobField';
import { ValidationError } from '../../../domain/errors';

@injectable()
export class CreateJobFieldUseCase implements ICreateJobFieldUseCase {
    constructor(
        @inject(TYPES.JobFieldRepository) private _jobFieldRepository: IJobFieldRepository
    ) { }

    async execute(input: CreateJobFieldInput): Promise<CreateJobFieldOutput> {
        // Check if field already exists
        const existing = await this._jobFieldRepository.findByTypeAndName(input.type, input.name.trim());
        if (existing) {
            throw new ValidationError(`${input.type} "${input.name}" already exists`);
        }

        // Create the field
        const fieldData = JobField.create({
            type: input.type,
            name: input.name.trim(),
        });

        const created = await this._jobFieldRepository.create(fieldData);

        return {
            id: created.id,
            type: created.type,
            name: created.name,
            message: `${input.type} created successfully`,
        };
    }
}
