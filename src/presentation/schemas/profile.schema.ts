import { Type, Static } from '@sinclair/typebox';

// Work History Schema
const WorkHistorySchema = Type.Object({
  companyName: Type.String({ minLength: 1, maxLength: 200 }),
  positionTitle: Type.String({ minLength: 1, maxLength: 200 }),
  startDate: Type.String({ format: 'date' }),
  endDate: Type.Union([Type.String({ format: 'date' }), Type.Null()]),
  description: Type.String({ maxLength: 2000 }),
  technologiesUsed: Type.Array(Type.String()),
  achievements: Type.Array(Type.String())
});

// Education Schema
const EducationSchema = Type.Object({
  degreeType: Type.String({ minLength: 1, maxLength: 50 }),
  institution: Type.String({ minLength: 1, maxLength: 200 }),
  fieldOfStudy: Type.String({ minLength: 1, maxLength: 200 }),
  graduationYear: Type.Union([Type.Number({ minimum: 1900, maximum: 2100 }), Type.Null()])
});

// Certification Schema
const CertificationSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 200 }),
  issuingOrganization: Type.String({ minLength: 1, maxLength: 200 }),
  dateObtained: Type.String({ format: 'date' })
});

// Project Schema
const ProjectSchema = Type.Object({
  name: Type.String({ minLength: 1, maxLength: 200 }),
  description: Type.String({ maxLength: 2000 }),
  techStack: Type.Array(Type.String()),
  repositoryUrl: Type.Optional(Type.String({ format: 'uri' })),
  liveDemoUrl: Type.Optional(Type.String({ format: 'uri' })),
  roleInProject: Type.String({ minLength: 1, maxLength: 200 })
});

// Create Developer Profile Schema
export const CreateDeveloperProfileSchema = Type.Object({
  profilePhotoUrl: Type.String({ format: 'uri' }),
  bio: Type.String({ minLength: 1, maxLength: 1000 }),
  skills: Type.Array(Type.String(), { minItems: 1 }),
  techs: Type.Array(Type.String(), { minItems: 1 }),
  
  // ✅ Make these optional - can be omitted OR empty arrays
  workHistory: Type.Optional(Type.Array(WorkHistorySchema, { minItems: 0 })),
  
  employmentStatus: Type.Union([
    Type.Literal('employed'),
    Type.Literal('unemployed'),
    Type.Literal('self-employed'),
    Type.Literal('student'),
    Type.Literal('looking')
  ]),
  
  // ✅ Make these optional
  education: Type.Optional(Type.Array(EducationSchema, { minItems: 0 })),
  certifications: Type.Array(CertificationSchema, { minItems: 0 }),
  
  githubUrl: Type.String({ format: 'uri' }),
  portfolioUrl: Type.Optional(Type.String({ format: 'uri' })),
  
  // ✅ Make these optional
  projects: Type.Optional(Type.Array(ProjectSchema, { minItems: 0 })),
  
  linkedinUrl: Type.String({ format: 'uri' }),
  desiredSalary: Type.Optional(Type.Number({ minimum: 0 })),
  jobTypePreferences: Type.Array(Type.Union([
    Type.Literal('full-time'),
    Type.Literal('part-time'),
    Type.Literal('contract'),
    Type.Literal('freelance')
  ]), { minItems: 1 }),
  workArrangement: Type.Array(Type.Union([
    Type.Literal('remote'),
    Type.Literal('hybrid'),
    Type.Literal('on-site')
  ]), { minItems: 1 }),
  yearsExperience: Type.Number({ minimum: 0, maximum: 100 }),
  seniorityLevel: Type.Union([
    Type.Literal('junior'),
    Type.Literal('mid'),
    Type.Literal('senior'),
    Type.Literal('lead')
  ]),
  willingToRelocate: Type.Boolean(),
  resumeUrl: Type.String({ format: 'uri' })
});


// Company Size Schema
const CompanySizeSchema = Type.Union([
  Type.Literal('1-10'),
  Type.Literal('11-50'),
  Type.Literal('51-200'),
  Type.Literal('201-500'),
  Type.Literal('501-1000'),
  Type.Literal('1000+')
]);

// Create Company Profile Schema
export const CreateCompanyProfileSchema = Type.Object({
  fullName: Type.String({ minLength: 1, maxLength: 200 }),
  phoneNumber: Type.String({ minLength: 1, maxLength: 20 }),
  companyName: Type.String({ minLength: 1, maxLength: 200 }),
  companyWebsite: Type.String({ format: 'uri' }),
  companySize: CompanySizeSchema,
  businessRegistrationNumber: Type.String({ minLength: 1, maxLength: 100 }),
  businessAddress: Type.String({ minLength: 1, maxLength: 500 }),
  businessRegistrationProofUrl: Type.String({ format: 'uri' }),
  employmentVerificationUrl: Type.String({ format: 'uri' })
});

// Update Developer Profile Schema (all fields optional except userId)
export const UpdateDeveloperProfileSchema = Type.Object({
  profilePhotoUrl: Type.Optional(Type.String({ format: 'uri' })),
  bio: Type.Optional(Type.String({ maxLength: 1000 })),
  skills: Type.Optional(Type.Array(Type.String())),
  techs: Type.Optional(Type.Array(Type.String())),
  workHistory: Type.Optional(Type.Array(WorkHistorySchema)),
  employmentStatus: Type.Optional(Type.Union([
    Type.Literal('employed'),
    Type.Literal('unemployed'),
    Type.Literal('self-employed'),
    Type.Literal('student'),
    Type.Literal('looking')
  ])),
  education: Type.Optional(Type.Array(EducationSchema)),
  certifications: Type.Optional(Type.Array(CertificationSchema)),
  githubUrl: Type.Optional(Type.String({ format: 'uri' })),
  portfolioUrl: Type.Optional(Type.String({ format: 'uri' })),
  projects: Type.Optional(Type.Array(ProjectSchema)),
  linkedinUrl: Type.Optional(Type.String({ format: 'uri' })),
  desiredSalary: Type.Optional(Type.Number({ minimum: 0 })),
  jobTypePreferences: Type.Optional(Type.Array(Type.Union([
    Type.Literal('full-time'),
    Type.Literal('part-time'),
    Type.Literal('contract'),
    Type.Literal('freelance')
  ]))),
  workArrangement: Type.Optional(Type.Array(Type.Union([
    Type.Literal('remote'),
    Type.Literal('hybrid'),
    Type.Literal('on-site')
  ]))),
  yearsExperience: Type.Optional(Type.Number({ minimum: 0, maximum: 100 })),
  seniorityLevel: Type.Optional(Type.Union([
    Type.Literal('junior'),
    Type.Literal('mid'),
    Type.Literal('senior'),
    Type.Literal('lead')
  ])),
  willingToRelocate: Type.Optional(Type.Boolean()),
  resumeUrl: Type.Optional(Type.String({ format: 'uri' }))
});

// Export TypeScript types
export type CreateDeveloperProfileInput = Static<typeof CreateDeveloperProfileSchema>;
export type UpdateDeveloperProfileInput = Static<typeof UpdateDeveloperProfileSchema>;
export type CreateCompanyProfileInput = Static<typeof CreateCompanyProfileSchema>;

