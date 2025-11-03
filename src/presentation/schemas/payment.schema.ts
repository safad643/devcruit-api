import { Type, Static } from '@sinclair/typebox';

export const PlanTierSchema = Type.Union([
  Type.Literal('Basic'),
  Type.Literal('Standard'),
  Type.Literal('Premium')
]);

export const CreateCheckoutSchema = Type.Object({
  plan: PlanTierSchema,
  successUrl: Type.String({ format: 'uri' }),
  cancelUrl: Type.String({ format: 'uri' })
});

export type CreateCheckoutInput = Static<typeof CreateCheckoutSchema>;


