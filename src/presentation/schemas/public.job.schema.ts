import { Type, Static } from '@sinclair/typebox';

export const PublicListJobsQuerySchema = Type.Object({
  page: Type.Optional(Type.Union([
    Type.Integer({ minimum: 1 }),
    Type.String({ pattern: '^[0-9]+$' })
  ])),
  limit: Type.Optional(Type.Union([
    Type.Integer({ minimum: 1, maximum: 50 }),
    Type.String({ pattern: '^[0-9]+$' })
  ])),
  query: Type.Optional(Type.String({ minLength: 1 })),
  company: Type.Optional(Type.String({ minLength: 1 })),
  location: Type.Optional(Type.String({ minLength: 1 })),
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
  experienceLevel: Type.Optional(Type.Union([
    Type.Literal('junior'),
    Type.Literal('mid'),
    Type.Literal('senior'),
    Type.Literal('lead')
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

export type PublicListJobsQueryInput = Static<typeof PublicListJobsQuerySchema>;

export const PublicJobIdParamsSchema = Type.Object({
  id: Type.String({ minLength: 1 })
});


