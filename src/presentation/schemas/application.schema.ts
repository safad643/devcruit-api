import { Type, Static } from '@sinclair/typebox';
import { InterviewRoundResult } from '../../domain/entities/Application';

// Create Application Schema
export const CreateApplicationSchema = Type.Object({
  jobId: Type.String({ minLength: 1 }),
  resumeUrl: Type.Optional(Type.String({ format: 'uri' }))
});

export type CreateApplicationInput = Static<typeof CreateApplicationSchema>;

// List Applications for Company Query Schema
export const ListApplicationsForCompanyQuerySchema = Type.Object({
  jobId: Type.Optional(Type.String({ minLength: 1 })),
  status: Type.Optional(Type.Union([
    Type.Literal('applied'),
    Type.Literal('shortlisted'),
    Type.Literal('interviewing'),
    Type.Literal('interview_completed'),
    Type.Literal('rejected'),
    Type.Literal('offer_extended'),
    Type.Literal('offer_accepted'),
    Type.Literal('offer_declined'),
    Type.Literal('withdrawn')
  ])),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
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
  jobId: Type.Optional(Type.String({ minLength: 1 })),
  status: Type.Optional(Type.Union([
    Type.Literal('applied'),
    Type.Literal('shortlisted'),
    Type.Literal('interviewing'),
    Type.Literal('interview_completed'),
    Type.Literal('rejected'),
    Type.Literal('offer_extended'),
    Type.Literal('offer_accepted'),
    Type.Literal('offer_declined'),
    Type.Literal('withdrawn')
  ])),
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
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

// Schedule Interview Round Schema
export const ScheduleInterviewRoundSchema = Type.Object({
  roundName: Type.String({ minLength: 1 }),
  interviewerId: Type.String({ minLength: 1 }),
  scheduledAt: Type.String({ format: 'date-time' })
});

export type ScheduleInterviewRoundInput = Static<typeof ScheduleInterviewRoundSchema>;

// Update Interview Result Schema
export const UpdateInterviewResultSchema = Type.Object({
  roundName: Type.String({ minLength: 1 }),
  result: Type.Union([
    Type.Literal(InterviewRoundResult.PASS),
    Type.Literal(InterviewRoundResult.FAIL),
    Type.Literal(InterviewRoundResult.ON_HOLD)
  ]),
  feedback: Type.Optional(Type.String({ maxLength: 2000 }))
});

export type UpdateInterviewResultInput = Static<typeof UpdateInterviewResultSchema>;

// Application + Interview Round params (for video call endpoints)
export const ApplicationInterviewRoundParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 }),
  roundName: Type.String({ minLength: 1 }),
});

export type ApplicationInterviewRoundParamsInput = Static<typeof ApplicationInterviewRoundParamsSchema>;

// Extend Offer Schema (Company)
export const ExtendOfferSchema = Type.Object({
  note: Type.Optional(Type.String({ maxLength: 500 }))
});

export type ExtendOfferInput = Static<typeof ExtendOfferSchema>;

// Accept Offer Schema (Developer) - no body needed
export const AcceptOfferSchema = Type.Object({});

export type AcceptOfferInput = Static<typeof AcceptOfferSchema>;

// Decline Offer Schema (Developer)
export const DeclineOfferSchema = Type.Object({
  note: Type.Optional(Type.String({ maxLength: 500 }))
});

export type DeclineOfferInput = Static<typeof DeclineOfferSchema>;

// Create Offer Letter Schema (Company)
export const CreateOfferLetterSchema = Type.Object({
  offeredSalary: Type.Number({ minimum: 0 }),
  salaryCurrency: Type.String({ minLength: 1, maxLength: 10 }),
  salaryFrequency: Type.Union([
    Type.Literal('monthly'),
    Type.Literal('annual')
  ]),
  proposedStartDate: Type.String({ format: 'date-time' }),
  offerExpirationDate: Type.String({ format: 'date-time' }),
  probationPeriodMonths: Type.Integer({ minimum: 0, maximum: 12 }),
  noticePeriodDays: Type.Integer({ minimum: 0, maximum: 180 }),
  reportingManager: Type.Optional(Type.String({ maxLength: 200 })),
  documentsRequired: Type.Array(Type.String({ minLength: 1 })),
  additionalTerms: Type.Optional(Type.String({ maxLength: 2000 })),
  signatoryDesignation: Type.Optional(Type.String({ maxLength: 200 }))
});

export type CreateOfferLetterInput = Static<typeof CreateOfferLetterSchema>;

