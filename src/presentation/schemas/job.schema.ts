import { Type, Static } from '@sinclair/typebox';

// Compensation Schema
// - Hidden: { mode: 'hidden' }
// - Range: { mode: 'range', min, max, currency }
const CompensationSchema = Type.Union([
  Type.Object({
    mode: Type.Literal('hidden')
  }),
  Type.Object({
    mode: Type.Literal('range'),
    min: Type.Number({ minimum: 0 }),
    max: Type.Number({ minimum: 0 }),
    currency: Type.String({ minLength: 1, maxLength: 10 })
  })
]);

// Create Job Schema
export const CreateJobSchema = Type.Object({
  title: Type.String({ minLength: 1, maxLength: 200 }),
  description: Type.String({ minLength: 1, maxLength: 10000 }),
  category: Type.String({ minLength: 1, maxLength: 100 }),
  requiredTech: Type.Array(Type.String(), { minItems: 1 }),
  requiredSkills: Type.Array(Type.String(), { minItems: 1 }),
  experienceLevel: Type.Union([
    Type.Literal('junior'),
    Type.Literal('mid'),
    Type.Literal('senior'),
    Type.Literal('lead')
  ]),
  minYears: Type.Number({ minimum: 0, maximum: 100 }),
  niceTech: Type.Array(Type.String(), { minItems: 0 }),
  niceSkills: Type.Array(Type.String(), { minItems: 0 }),
  interviewRounds: Type.Array(Type.String({ minLength: 1 }), { minItems: 1 }),
  jobType: Type.Union([
    Type.Literal('full-time'),
    Type.Literal('part-time'),
    Type.Literal('contract'),
    Type.Literal('freelance')
  ]),
  workArrangement: Type.Union([
    Type.Literal('remote'),
    Type.Literal('hybrid'),
    Type.Literal('on-site')
  ]),
  location: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  relocation: Type.Boolean(),
  compensation: CompensationSchema,
  benefits: Type.Optional(Type.String({ maxLength: 2000 })),
  validUntil: Type.String({ format: 'date' }),
  autoShortlist: Type.Boolean(),
  status: Type.Union([
    Type.Literal('draft'),
    Type.Literal('open')
  ])
});

// List Jobs Query Schema
export const ListJobsQuerySchema = Type.Object({
  page: Type.Optional(Type.Integer({ minimum: 1 })),
  limit: Type.Optional(Type.Integer({ minimum: 1, maximum: 100 })),
  search: Type.Optional(Type.String({ minLength: 1 })),
  status: Type.Optional(Type.Union([
    Type.Literal('draft'),
    Type.Literal('open'),
    Type.Literal('closed'),
    Type.Literal('all')
  ])),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('createdAt'),
    Type.Literal('validUntil')
  ])),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
});

// Export TypeScript types
export type CreateJobInput = Static<typeof CreateJobSchema>;
export type ListJobsQueryInput = Static<typeof ListJobsQuerySchema>;

// Params schema
export const JobIdParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 })
});

// Update Job Schema - all fields are now editable (since we prevent editing after applications)
export const UpdateJobSchema = Type.Object({
  title: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  description: Type.Optional(Type.String({ minLength: 1, maxLength: 10000 })),
  category: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
  requiredTech: Type.Optional(Type.Array(Type.String(), { minItems: 1 })),
  requiredSkills: Type.Optional(Type.Array(Type.String(), { minItems: 1 })),
  experienceLevel: Type.Optional(Type.Union([
    Type.Literal('junior'),
    Type.Literal('mid'),
    Type.Literal('senior'),
    Type.Literal('lead')
  ])),
  minYears: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
  niceTech: Type.Optional(Type.Array(Type.String(), { minItems: 0 })),
  niceSkills: Type.Optional(Type.Array(Type.String(), { minItems: 0 })),
  interviewRounds: Type.Optional(Type.Array(Type.String({ minLength: 1 }), { minItems: 1 })),
  jobType: Type.Optional(Type.Union([
    Type.Literal('full-time'),
    Type.Literal('part-time'),
    Type.Literal('contract'),
    Type.Literal('freelance')
  ])),
  workArrangement: Type.Optional(Type.Union([
    Type.Literal('remote'),
    Type.Literal('hybrid'),
    Type.Literal('on-site')
  ])),
  location: Type.Optional(Type.String({ minLength: 1, maxLength: 200 })),
  relocation: Type.Optional(Type.Boolean()),
  compensation: Type.Optional(CompensationSchema),
  benefits: Type.Optional(Type.String({ maxLength: 2000 })),
  validUntil: Type.Optional(Type.String({ format: 'date' })),
  autoShortlist: Type.Optional(Type.Boolean()),
});

export type UpdateJobInput = Static<typeof UpdateJobSchema>;

