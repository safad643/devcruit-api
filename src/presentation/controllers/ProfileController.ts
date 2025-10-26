import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { 
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase
} from '../../application/use-cases/profile';
import {
  CreateDeveloperProfileInput,
  UpdateDeveloperProfileInput
} from '../schemas/profile.schema';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.CreateDeveloperProfileUseCase) private createProfileUseCase: CreateDeveloperProfileUseCase,
    @inject(TYPES.GetDeveloperProfileUseCase) private getProfileUseCase: GetDeveloperProfileUseCase
  ) {}

  createProfile = async (
    request: FastifyRequest<{ Body: CreateDeveloperProfileInput }>, 
    reply: FastifyReply
  ): Promise<void> => {
    const result = await this.createProfileUseCase.execute(request.body);
    reply.status(201).send(result);
  };

  getProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Get userId from the authenticated user (from token)
    const userId = (request as any).user.id;
    const result = await this.getProfileUseCase.execute(userId);
    reply.status(200).send(result);
  };
}

