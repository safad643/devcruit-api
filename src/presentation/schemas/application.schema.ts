import { Type, Static } from '@sinclair/typebox';

// Create Application Schema
export const CreateApplicationSchema = Type.Object({
  jobId: Type.String({ minLength: 1 })
});

export type CreateApplicationInput = Static<typeof CreateApplicationSchema>;

// List Applications for Company Query Schema
export const ListApplicationsForCompanyQuerySchema = Type.Object({
  jobId: Type.Optional(Type.String({ minLength: 1 })),
  status: Type.Optional(Type.Union([
    Type.Literal('applied'),
    Type.Literal('shortlisted'),
    Type.Literal('interviewing'),
    Type.Literal('rejected'),
    Type.Literal('offer_extended'),
    Type.Literal('offer_accepted'),
    Type.Literal('offer_declined'),
    Type.Literal('withdrawn')
  ])),
  page: Type.Optional(Type.Union([
    Type.Integer({ minimum: 1 }),
    Type.String({ pattern: '^[0-9]+$' })
  ])),
  limit: Type.Optional(Type.Union([
    Type.Integer({ minimum: 1, maximum: 100 }),
    Type.String({ pattern: '^[0-9]+$' })
  ])),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('appliedAt'),
    Type.Literal('lastUpdatedAt')
  ])),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});

export type ListApplicationsForCompanyQueryInput = Static<typeof ListApplicationsForCompanyQuerySchema>;

// List Applications for Developer Query Schema
export const ListApplicationsForDeveloperQuerySchema = Type.Object({
  status: Type.Optional(Type.Union([
    Type.Literal('applied'),
    Type.Literal('shortlisted'),
    Type.Literal('interviewing'),
    Type.Literal('rejected'),
    Type.Literal('offer_extended'),
    Type.Literal('offer_accepted'),
    Type.Literal('offer_declined'),
    Type.Literal('withdrawn')
  ])),
  page: Type.Optional(Type.Union([
    Type.Integer({ minimum: 1 }),
    Type.String({ pattern: '^[0-9]+$' })
  ])),
  limit: Type.Optional(Type.Union([
    Type.Integer({ minimum: 1, maximum: 100 }),
    Type.String({ pattern: '^[0-9]+$' })
  ])),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('appliedAt'),
    Type.Literal('lastUpdatedAt')
  ])),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});

export type ListApplicationsForDeveloperQueryInput = Static<typeof ListApplicationsForDeveloperQuerySchema>;

// Application ID Params Schema
export const ApplicationIdParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 })
});

// Withdraw Application Schema
export const WithdrawApplicationSchema = Type.Object({
  applicationId: Type.String({ minLength: 1 })
});

export type WithdrawApplicationInput = Static<typeof WithdrawApplicationSchema>;

// Update Application Status Schema (Shortlist Only - optional note)
export const UpdateApplicationStatusSchema = Type.Object({
  note: Type.Optional(Type.String({ maxLength: 500 }))
});

export type UpdateApplicationStatusInput = Static<typeof UpdateApplicationStatusSchema>;

// Reject Application Schema
export const RejectApplicationSchema = Type.Object({
  note: Type.Optional(Type.String({ maxLength: 500 }))
});

export type RejectApplicationInput = Static<typeof RejectApplicationSchema>;

