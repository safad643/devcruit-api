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
      documentKey: Type.Union([
        Type.Literal('COMPANY_REGISTRATION_DOCUMENT'),
        Type.Literal('COMPANY_VERIFICATION_DOCUMENT')
      ]),
      note: Type.Optional(Type.String())
    }),
    { minItems: 1 }
  )
});

// List Companies Schema
export const ListCompaniesSchema = Type.Object({
  page: Type.Integer({ minimum: 1 }),
  limit: Type.Integer({ minimum: 1, maximum: 100 }),
  search: Type.Optional(Type.String({ minLength: 1 })),
  status: Type.Optional(Type.Union([
    Type.Literal('pending'),
    Type.Literal('approved'),
    Type.Literal('rejected'),
    Type.Literal('resubmitted'),
    Type.Literal('paid'),
    Type.Literal('all')
  ])),
  isBlocked: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('createdAt'),
    Type.Literal('updatedAt'),
    Type.Literal('companyName')
  ])),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});

// List Developers Schema
export const ListDevelopersSchema = Type.Object({
  page: Type.Integer({ minimum: 1 }),
  limit: Type.Integer({ minimum: 1, maximum: 100 }),
  search: Type.Optional(Type.String({ minLength: 1 })),
  isBlocked: Type.Optional(Type.Boolean()),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('createdAt'),
    Type.Literal('updatedAt')
  ])),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});

// Export TypeScript types
export type BlockUserInput = Static<typeof BlockUserSchema>;
export type UnblockUserInput = Static<typeof UnblockUserSchema>;
export type ApproveCompanyInput = Static<typeof ApproveCompanySchema>;
export type RejectCompanyInput = Static<typeof RejectCompanySchema>;
export type ListCompaniesInput = Static<typeof ListCompaniesSchema>;
export type ListDevelopersInput = Static<typeof ListDevelopersSchema>;

