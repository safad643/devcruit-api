import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { 
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase,
  CreateCompanyProfileUseCase,
  GetAdminCompanyListUseCase
} from '../../application/use-cases/profile';
import {
  CreateDeveloperProfileInput,
  UpdateDeveloperProfileInput,
  CreateCompanyProfileInput
} from '../schemas/profile.schema';
import { GetAdminCompanyListInput } from '../../application/dtos/profile.dto';
import { GetAdminCompanyListQuery } from '../schemas/profile.schema';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.CreateDeveloperProfileUseCase) private createProfileUseCase: CreateDeveloperProfileUseCase,
    @inject(TYPES.GetDeveloperProfileUseCase) private getProfileUseCase: GetDeveloperProfileUseCase,
    @inject(TYPES.CreateCompanyProfileUseCase) private createCompanyProfileUseCase: CreateCompanyProfileUseCase,
    @inject(TYPES.GetAdminCompanyListUseCase) private getAdminCompanyListUseCase: GetAdminCompanyListUseCase
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

  getAdminCompanyList = async (
    request: FastifyRequest<{ Querystring: GetAdminCompanyListQuery }>,
    reply: FastifyReply
  ): Promise<void> => {
    const { page = 1, limit = 10, search, searchField, status, companySize, isVerified, sortBy, sortOrder } = request.query;
    const input: GetAdminCompanyListInput = {
      page,
      limit,
      search,
      searchField,
      status,
      companySize,
      isVerified,
      sortBy,
      sortOrder,
    };
    const result = await this.getAdminCompanyListUseCase.execute(input);
    reply.status(200).send(result);
  };
}

