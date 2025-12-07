import { JobField, JobFieldProps, FieldType } from '../entities/JobField';

export interface IJobFieldRepository {
    create(data: Omit<JobFieldProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<JobField>;
    findById(id: string): Promise<JobField | null>;
    findByTypeAndName(type: FieldType, name: string): Promise<JobField | null>;
    findAllByType(type: FieldType): Promise<JobField[]>;
    update(id: string, data: { name: string }): Promise<JobField>;
    delete(id: string): Promise<void>;
    /**
     * Returns names that do NOT exist in the database for the given type
     */
    findMissingNames(type: FieldType, names: string[]): Promise<string[]>;
}
