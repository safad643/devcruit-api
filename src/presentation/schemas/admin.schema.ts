import { Type, Static } from '@sinclair/typebox';

// Block User Schema
export const BlockUserSchema = Type.Object({
  userId: Type.String({ minLength: 1 })
});

// Unblock User Schema
export const UnblockUserSchema = Type.Object({
  userId: Type.String({ minLength: 1 })
});

// Approve Company Schema
export const ApproveCompanySchema = Type.Object({
  companyId: Type.String({ minLength: 1 })
});

// Reject Company Schema
export const RejectCompanySchema = Type.Object({
  companyId: Type.String({ minLength: 1 }),
  documents: Type.Array(
    Type.Object({
      documentKey: Type.String({ minLength: 1 }),
      note: Type.Optional(Type.String())
    }),
    { minItems: 1 }
  )
});

// Export TypeScript types
export type BlockUserInput = Static<typeof BlockUserSchema>;
export type UnblockUserInput = Static<typeof UnblockUserSchema>;
export type ApproveCompanyInput = Static<typeof ApproveCompanySchema>;
export type RejectCompanyInput = Static<typeof RejectCompanySchema>;

