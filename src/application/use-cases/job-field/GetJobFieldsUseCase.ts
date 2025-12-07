import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IJobFieldRepository } from '../../../domain/repositories/IJobFieldRepository';
import { IGetJobFieldsUseCase } from './interfaces';
import { GetJobFieldsInput, GetJobFieldsOutput } from '../../dtos/jobField.dto';

@injectable()
export class GetJobFieldsUseCase implements IGetJobFieldsUseCase {
    constructor(
        @inject(TYPES.JobFieldRepository) private jobFieldRepository: IJobFieldRepository
    ) { }

    async execute(input: GetJobFieldsInput): Promise<GetJobFieldsOutput> {
        const fields = await this.jobFieldRepository.findAllByType(input.type);

        return {
            fields: fields.map(field => ({
                id: field.id,
                type: field.type,
                name: field.name,
                createdAt: field.createdAt,
            })),
        };
    }
}
