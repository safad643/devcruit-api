import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { 
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase,
  CreateCompanyProfileUseCase
} from '../../application/use-cases/profile';
import {
  CreateDeveloperProfileInput,
  UpdateDeveloperProfileInput,
  CreateCompanyProfileInput
} from '../schemas/profile.schema';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.CreateDeveloperProfileUseCase) private createProfileUseCase: CreateDeveloperProfileUseCase,
    @inject(TYPES.GetDeveloperProfileUseCase) private getProfileUseCase: GetDeveloperProfileUseCase,
    @inject(TYPES.CreateCompanyProfileUseCase) private createCompanyProfileUseCase: CreateCompanyProfileUseCase
  ) {}

  createProfile = async (
    request: FastifyRequest<{ Body: CreateDeveloperProfileInput }>, 
    reply: FastifyReply
  ): Promise<void> => {

    const userId = request.user?.id as string; //wont reach here is req.user is not avaible so its fine to assert
    const result = await this.createProfileUseCase.execute({ ...request.body, userId });
    reply.status(201).send(result);
  };

  createCompanyProfile = async (
    request: FastifyRequest<{ Body: CreateCompanyProfileInput }>,
    reply: FastifyReply
  ): Promise<void> => {

    const userId = request.user?.id as string;
    const result = await this.createCompanyProfileUseCase.execute({ ...request.body, userId });
    reply.status(201).send(result);
  };

  getProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    // Get userId from the authenticated user (from token)
    const userId = (request as any).user.id;
    const result = await this.getProfileUseCase.execute(userId);
    reply.status(200).send(result);
  };
}

