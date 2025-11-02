import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ProfileController } from '../controllers/ProfileController';
import { CreateDeveloperProfileSchema, CreateCompanyProfileSchema } from '../schemas/profile.schema';
import { authenticate } from '../middleware/authenticate';

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
}

