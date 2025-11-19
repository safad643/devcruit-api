import { Type, Static } from '@sinclair/typebox';

export const GenerateSignatureSchema = Type.Object({
  timestamp: Type.Integer(),
  category: Type.Union([
    Type.Literal('PROFILE_PICTURE'),
    Type.Literal('DEGREE_CERTIFICATE'),
    Type.Literal('CV'),
    Type.Literal('COMPANY_REGISTRATION_DOCUMENT'),
    Type.Literal('COMPANY_VERIFICATION_DOCUMENT'),
    Type.Literal('COMPANY_LOGO')
  ])
});

export type GenerateSignatureInput = Static<typeof GenerateSignatureSchema>;

export const DeleteFileSchema = Type.Object({
  publicId: Type.String({ minLength: 1 })
});

export type DeleteFileInput = Static<typeof DeleteFileSchema>;
