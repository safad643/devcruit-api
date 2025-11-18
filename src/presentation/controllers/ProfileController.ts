import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { 
  CreateDeveloperProfileUseCase,
  GetDeveloperProfileUseCase,
  CreateCompanyProfileUseCase,
  GetCompanyProfileUseCase,
  UpdateDeveloperProfileUseCase,
  UpdateCompanyProfileUseCase,
  ResubmitDocumentsUseCase,
  InviteCompanyTeamMemberUseCase,
  ListCompanyTeamMembersUseCase
} from '../../application/use-cases/profile';
import {
  CreateDeveloperProfileInput,
  CreateCompanyProfileInput,
  UpdateDeveloperProfileInput,
  UpdateCompanyProfileInput,
  ResubmitDocumentsInput,
  InviteCompanyTeamMemberInput
} from '../schemas/profile.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.CreateDeveloperProfileUseCase) private createProfileUseCase: CreateDeveloperProfileUseCase,
    @inject(TYPES.GetDeveloperProfileUseCase) private getDeveloperProfileUseCase: GetDeveloperProfileUseCase,
    @inject(TYPES.GetCompanyProfileUseCase) private getCompanyProfileUseCase: GetCompanyProfileUseCase,
    @inject(TYPES.CreateCompanyProfileUseCase) private createCompanyProfileUseCase: CreateCompanyProfileUseCase,
    @inject(TYPES.UpdateDeveloperProfileUseCase) private updateDeveloperProfileUseCase: UpdateDeveloperProfileUseCase,
    @inject(TYPES.UpdateCompanyProfileUseCase) private updateCompanyProfileUseCase: UpdateCompanyProfileUseCase,
    @inject(TYPES.ResubmitDocumentsUseCase) private resubmitDocumentsUseCase: ResubmitDocumentsUseCase,
    @inject(TYPES.InviteCompanyTeamMemberUseCase) private inviteCompanyTeamMemberUseCase: InviteCompanyTeamMemberUseCase,
    @inject(TYPES.ListCompanyTeamMembersUseCase) private listCompanyTeamMembersUseCase: ListCompanyTeamMembersUseCase
  ) {}

  createProfile = async (
    request: FastifyRequest<{ Body: CreateDeveloperProfileInput }>, 
    reply: FastifyReply
  ): Promise<void> => {

    const userId = request.user?.id as string; //wont reach here is req.user is not avaible so its fine to assert
    const result = await this.createProfileUseCase.execute({ ...(request.body as any), userId });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  createCompanyProfile = async (
    request: FastifyRequest<{ Body: CreateCompanyProfileInput }>,
    reply: FastifyReply
  ): Promise<void> => {

    const userId = request.user?.id as string;
    const result = await this.createCompanyProfileUseCase.execute({ ...request.body, userId });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  getProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user?.id as string;
    const role = request.user?.role;

    if (role === 'company') {
      const result = await this.getCompanyProfileUseCase.execute(userId);
      reply.status(HttpStatus.OK).send(wrapSuccess(result));
    } else if (role === 'developer') {
      const result = await this.getDeveloperProfileUseCase.execute(userId);
      reply.status(HttpStatus.OK).send(wrapSuccess(result));
    } else {
      reply.status(HttpStatus.BAD_REQUEST).send({ success: false, error: { message: 'Invalid user role for profile endpoint' } });
    }
  };

  updateDeveloperProfile = async (
    request: FastifyRequest<{ Body: UpdateDeveloperProfileInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const role = request.user?.role;

    if (role !== 'developer') {
      reply
        .status(HttpStatus.FORBIDDEN)
        .send({ success: false, error: { message: 'Only developers can update developer profiles' } });
      return;
    }

    const result = await this.updateDeveloperProfileUseCase.execute(userId, request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  updateCompanyProfile = async (
    request: FastifyRequest<{ Body: UpdateCompanyProfileInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const role = request.user?.role;

    if (role !== 'company') {
      reply
        .status(HttpStatus.FORBIDDEN)
        .send({ success: false, error: { message: 'Only companies can update company profiles' } });
      return;
    }

    const result = await this.updateCompanyProfileUseCase.execute(userId, request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  resubmitDocuments = async (
    request: FastifyRequest<{ Body: ResubmitDocumentsInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const result = await this.resubmitDocumentsUseCase.execute({ 
      userId,
      documents: request.body.documents
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  listCompanyTeam = async (
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = (request as any).companyContext;
    const companyUserId = companyContext?.companyUserId ?? (request.user?.id as string);
    const result = await this.listCompanyTeamMembersUseCase.execute(companyUserId);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  inviteCompanyTeamMember = async (
    request: FastifyRequest<{ Body: InviteCompanyTeamMemberInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const inviterUserId = request.user?.id as string;
    const result = await this.inviteCompanyTeamMemberUseCase.execute({
      inviterUserId,
      email: request.body.email,
      role: request.body.role,
      fullName: request.body.fullName,
      jobTitle: request.body.jobTitle,
    });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };
}

