import { FieldType } from '../../domain/entities/JobField';

// Create Job Field
export interface CreateJobFieldInput {
    type: FieldType;
    name: string;
}

export interface CreateJobFieldOutput {
    id: string;
    type: FieldType;
    name: string;
    message: string;
}

// Get Job Fields
export interface GetJobFieldsInput {
    type: FieldType;
}

export interface JobFieldItem {
    id: string;
    type: FieldType;
    name: string;
    createdAt: Date;
}

export interface GetJobFieldsOutput {
    fields: JobFieldItem[];
}

// Update Job Field
export interface UpdateJobFieldInput {
    id: string;
    name: string;
}

export interface UpdateJobFieldOutput {
    id: string;
    type: FieldType;
    name: string;
    message: string;
}

// Delete Job Field
export interface DeleteJobFieldInput {
    id: string;
}

export interface DeleteJobFieldOutput {
    id: string;
    message: string;
}
