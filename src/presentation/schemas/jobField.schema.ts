import { Type, Static } from '@sinclair/typebox';

// Field type enum
const FieldTypeEnum = Type.Union([
    Type.Literal('category'),
    Type.Literal('tech'),
    Type.Literal('skill')
]);

// Create Job Field Schema
export const CreateJobFieldSchema = Type.Object({
    type: FieldTypeEnum,
    name: Type.String({ minLength: 1, maxLength: 100 })
});

// Get Job Fields Query Schema
export const GetJobFieldsQuerySchema = Type.Object({
    type: FieldTypeEnum
});

// Update Job Field Schema
export const UpdateJobFieldSchema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 })
});

// Job Field ID Params Schema
export const JobFieldIdParamsSchema = Type.Object({
    id: Type.String({ minLength: 1 })
});

// Export TypeScript types
export type CreateJobFieldInput = Static<typeof CreateJobFieldSchema>;
export type GetJobFieldsInput = Static<typeof GetJobFieldsQuerySchema>;
export type UpdateJobFieldInput = Static<typeof UpdateJobFieldSchema>;
export type JobFieldIdParams = Static<typeof JobFieldIdParamsSchema>;
