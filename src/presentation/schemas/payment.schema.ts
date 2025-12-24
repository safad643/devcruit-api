import { Type, Static } from '@sinclair/typebox';

export const CreateCheckoutSchema = Type.Object({
  planId: Type.String({ minLength: 1 }),
  successUrl: Type.String({ format: 'uri' }),
  cancelUrl: Type.String({ format: 'uri' })
});

export type CreateCheckoutInput = Static<typeof CreateCheckoutSchema>;
