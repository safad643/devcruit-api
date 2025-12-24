import { Type, Static } from '@sinclair/typebox';

// Plan limits schema
const PlanLimitsSchema = Type.Object({
    maxActiveJobs: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]),
    maxTeamMembers: Type.Union([Type.Integer({ minimum: 1 }), Type.Null()]),
});

// Discount type enum
const DiscountTypeEnum = Type.Union([
    Type.Literal('percentage'),
    Type.Literal('fixed'),
]);

// Create Plan Schema
export const CreatePlanSchema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 100 }),
    description: Type.String({ minLength: 1, maxLength: 500 }),
    price: Type.Integer({ minimum: 0 }),
    currency: Type.String({ minLength: 3, maxLength: 3 }),
    durationMonths: Type.Integer({ minimum: 1 }),
    limits: PlanLimitsSchema,
    features: Type.Array(Type.String(), { minItems: 0, maxItems: 20 }),
    displayOrder: Type.Integer({ minimum: 0 }),
    isOffer: Type.Boolean(),
    offerLabel: Type.Optional(Type.String({ maxLength: 100 })),
    discountType: Type.Optional(DiscountTypeEnum),
    discountValue: Type.Optional(Type.Integer({ minimum: 0 })),
});

// Update Plan Schema
export const UpdatePlanSchema = Type.Object({
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 100 })),
    description: Type.Optional(Type.String({ minLength: 1, maxLength: 500 })),
    price: Type.Optional(Type.Integer({ minimum: 0 })),
    currency: Type.Optional(Type.String({ minLength: 3, maxLength: 3 })),
    durationMonths: Type.Optional(Type.Integer({ minimum: 1 })),
    limits: Type.Optional(PlanLimitsSchema),
    features: Type.Optional(Type.Array(Type.String(), { minItems: 0, maxItems: 20 })),
    displayOrder: Type.Optional(Type.Integer({ minimum: 0 })),
    isActive: Type.Optional(Type.Boolean()),
    isOffer: Type.Optional(Type.Boolean()),
    offerLabel: Type.Optional(Type.String({ maxLength: 100 })),
    discountType: Type.Optional(DiscountTypeEnum),
    discountValue: Type.Optional(Type.Integer({ minimum: 0 })),
});

// Plan ID Params Schema
export const PlanIdParamsSchema = Type.Object({
    id: Type.String({ minLength: 1 }),
});

// List Plans Query Schema (optional, for future filtering)
export const ListPlansQuerySchema = Type.Object({
    activeOnly: Type.Optional(Type.Boolean()),
});

// Export TypeScript types
export type CreatePlanInput = Static<typeof CreatePlanSchema>;
export type UpdatePlanInput = Static<typeof UpdatePlanSchema>;
export type PlanIdParams = Static<typeof PlanIdParamsSchema>;
export type ListPlansQuery = Static<typeof ListPlansQuerySchema>;
