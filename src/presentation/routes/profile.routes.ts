import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ProfileController } from '../controllers/ProfileController';
import {
  CreateDeveloperProfileSchema,
  CreateCompanyProfileSchema,
  UpdateDeveloperProfileSchema,
  UpdateCompanyProfileSchema,
  ResubmitDocumentsSchema,
  InviteCompanyTeamMemberSchema
} from '../schemas/profile.schema';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { checkCompanyPaid } from '../middleware/checkCompanyPaid';

export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  const profileController = container.get<ProfileController>(TYPES.ProfileController);
  fastify.addHook('preHandler', authenticate);

  fastify.post(
    '/create', 
    { 
      schema: { body: CreateDeveloperProfileSchema } 
    }, 
    profileController.createProfile
  );

  fastify.post(
    '/company/create',
    {
      schema: { body: CreateCompanyProfileSchema }
    },
    profileController.createCompanyProfile
  );

  fastify.get(
    '/me',
  
    profileController.getProfile
  );

  // Developer profile update
  fastify.patch(
    '/developer',
    {
      schema: { body: UpdateDeveloperProfileSchema }
    },
    profileController.updateDeveloperProfile
  );

  // Company profile update
  fastify.patch(
    '/company',
    {
      schema: { body: UpdateCompanyProfileSchema }
    },
    profileController.updateCompanyProfile
  );

  fastify.post(
    '/resubmitdocuments',
    {
      schema: { body: ResubmitDocumentsSchema }
    },
    profileController.resubmitDocuments
  );

  fastify.get(
    '/company/team',
    {
      preHandler: [authorize('company'), checkCompanyPaid],
    },
    profileController.listCompanyTeam
  );

  fastify.post(
    '/company/team/invite',
    {
      preHandler: [authorize('company'), checkCompanyPaid],
      schema: { body: InviteCompanyTeamMemberSchema }
    },
    profileController.inviteCompanyTeamMember
  );
}

