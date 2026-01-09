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
  InviteCompanyTeamMemberSchema,
  ListCompanyTeamQuerySchema
} from '../schemas/profile.schema';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { checkCompanyPaid } from '../middleware/checkCompanyPaid';

export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  const profileController = container.get<ProfileController>(TYPES.ProfileController);
  fastify.addHook('preHandler', authenticate);

  fastify.post(
    '/create',
    { schema: { body: CreateDeveloperProfileSchema } },
    profileController.createProfile
  );

  fastify.post(
    '/company/create',
    { schema: { body: CreateCompanyProfileSchema } },
    profileController.createCompanyProfile
  );

  fastify.get(
    '/me',
    {},
    profileController.getProfile
  );

  fastify.post(
    '/resubmitdocuments',
    { schema: { body: ResubmitDocumentsSchema } },
    profileController.resubmitDocuments
  );

  // Developer profile update
  fastify.register(async (developerRoutes) => {
    developerRoutes.addHook('preHandler', authorize('developer'));

    developerRoutes.patch(
      '/developer',
      { schema: { body: UpdateDeveloperProfileSchema } },
      profileController.updateDeveloperProfile
    );
  });

  // Company profile update
  fastify.register(async (companyRoutes) => {
    companyRoutes.addHook('preHandler', authorize('company'));

    companyRoutes.patch(
      '/company',
      { schema: { body: UpdateCompanyProfileSchema } },
      profileController.updateCompanyProfile
    );
  });

  // Company team routes (company/hr with paid check)
  fastify.register(async (teamRoutes) => {
    teamRoutes.addHook('preHandler', authorize('company', 'hr'));
    teamRoutes.addHook('preHandler', checkCompanyPaid);

    teamRoutes.get(
      '/company/team',
      { schema: { querystring: ListCompanyTeamQuerySchema } },
      profileController.listCompanyTeam
    );
  });

  // Company invite (company only with paid check)
  fastify.register(async (inviteRoutes) => {
    inviteRoutes.addHook('preHandler', authorize('company'));
    inviteRoutes.addHook('preHandler', checkCompanyPaid);

    inviteRoutes.post(
      '/company/team/invite',
      { schema: { body: InviteCompanyTeamMemberSchema } },
      profileController.inviteCompanyTeamMember
    );
  });
}

