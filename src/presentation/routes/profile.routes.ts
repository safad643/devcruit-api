import { FastifyInstance } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ProfileController } from '../controllers/ProfileController';
import { CreateDeveloperProfileSchema } from '../schemas/profile.schema';
import { authenticate } from '../middleware/authenticate';

export async function profileRoutes(fastify: FastifyInstance): Promise<void> {
  const profileController = container.get<ProfileController>(TYPES.ProfileController);

  fastify.post(
    '/create', 
    { 
      schema: { body: CreateDeveloperProfileSchema } 
    }, 
    profileController.createProfile
  );

  fastify.get(
    '/me',
    { preHandler: authenticate },
    profileController.getProfile
  );
}

