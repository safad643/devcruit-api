import { Type, Static } from '@sinclair/typebox';

export const DeleteFileSchema = Type.Object({
  publicId: Type.String({ minLength: 1 })
});

export type DeleteFileInput = Static<typeof DeleteFileSchema>;

