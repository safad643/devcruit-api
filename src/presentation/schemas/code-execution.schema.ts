import { Type, Static } from '@sinclair/typebox';

export const ExecuteCodeSchema = Type.Object({
    language: Type.String({ minLength: 1 }),
    code: Type.String({ minLength: 1 }),
});

export type ExecuteCodeInput = Static<typeof ExecuteCodeSchema>;
