import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { 
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase,
  CreateCompanyProfileUseCase,
  GetCompanyProfileUseCase
} from '../../application/use-cases/profile';
import {
  CreateDeveloperProfileInput,
  CreateCompanyProfileInput
} from '../schemas/profile.schema';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.CreateDeveloperProfileUseCase) private createProfileUseCase: CreateDeveloperProfileUseCase,
    @inject(TYPES.GetDeveloperProfileUseCase) private getDeveloperProfileUseCase: GetDeveloperProfileUseCase,
    @inject(TYPES.GetCompanyProfileUseCase) private getCompanyProfileUseCase: GetCompanyProfileUseCase,
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
    const userId = request.user?.id as string;
    const role = request.user?.role;

    if (role === 'company') {
      const result = await this.getCompanyProfileUseCase.execute(userId);
      reply.status(200).send(result);
    } else if (role === 'developer') {
      const result = await this.getDeveloperProfileUseCase.execute(userId);
      reply.status(200).send(result);
    } else {
      reply.status(400).send({ error: 'Invalid user role for profile endpoint' });
    }
  };
}

