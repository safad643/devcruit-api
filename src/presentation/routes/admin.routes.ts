import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ProfileController } from '../controllers/ProfileController';
import { authenticate } from '../middleware/authenticate';
import { authorize } from '../middleware/authorize';
import { GetAdminCompanyListQuerySchema } from '../schemas/profile.schema';

export async function adminRoutes(fastify: FastifyInstance): Promise<void> {
  const profileController = container.get<ProfileController>(TYPES.ProfileController);

  // Require authentication for all admin routes
  fastify.addHook('preHandler', authenticate);

  fastify.get(
    '/admin/companies',
    {
      preHandler: authorize('admin'),
      schema: { querystring: GetAdminCompanyListQuerySchema }
    },
    profileController.getAdminCompanyList
  );
}


