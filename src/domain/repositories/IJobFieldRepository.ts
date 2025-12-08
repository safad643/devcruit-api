import { JobField, JobFieldProps, FieldType } from '../entities/JobField';
import { IGenericRepository } from './IGenericRepository';

export type CreateJobFieldProps = Omit<JobFieldProps, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateJobFieldProps = { name: string };

export interface IJobFieldRepository extends IGenericRepository<JobField, CreateJobFieldProps, UpdateJobFieldProps> {
    findByTypeAndName(type: FieldType, name: string): Promise<JobField | null>;
    findAllByType(type: FieldType): Promise<JobField[]>;
    findMissingNames(type: FieldType, names: string[]): Promise<string[]>;
}
