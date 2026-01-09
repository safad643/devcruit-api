import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
  ICreateDeveloperProfileUseCase,
  IGetDeveloperProfileUseCase,
  ICreateCompanyProfileUseCase,
  IGetCompanyProfileUseCase,
  IUpdateDeveloperProfileUseCase,
  IUpdateCompanyProfileUseCase,
  IResubmitDocumentsUseCase,
  IInviteCompanyTeamMemberUseCase,
  IListCompanyTeamMembersUseCase,
} from '../../application/use-cases/profile/interfaces';
import {
  CreateDeveloperProfileInput,
  CreateCompanyProfileInput,
  UpdateDeveloperProfileInput,
  UpdateCompanyProfileInput,
  ResubmitDocumentsInput,
  InviteCompanyTeamMemberInput,
  ListCompanyTeamQueryInput
} from '../schemas/profile.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { ForbiddenError } from '../../domain/errors';

@injectable()
export class ProfileController {
  constructor(
    @inject(TYPES.CreateDeveloperProfileUseCase) private _createProfileUseCase: ICreateDeveloperProfileUseCase,
    @inject(TYPES.GetDeveloperProfileUseCase) private _getDeveloperProfileUseCase: IGetDeveloperProfileUseCase,
    @inject(TYPES.GetCompanyProfileUseCase) private _getCompanyProfileUseCase: IGetCompanyProfileUseCase,
    @inject(TYPES.CreateCompanyProfileUseCase) private _createCompanyProfileUseCase: ICreateCompanyProfileUseCase,
    @inject(TYPES.UpdateDeveloperProfileUseCase) private _updateDeveloperProfileUseCase: IUpdateDeveloperProfileUseCase,
    @inject(TYPES.UpdateCompanyProfileUseCase) private _updateCompanyProfileUseCase: IUpdateCompanyProfileUseCase,
    @inject(TYPES.ResubmitDocumentsUseCase) private _resubmitDocumentsUseCase: IResubmitDocumentsUseCase,
    @inject(TYPES.InviteCompanyTeamMemberUseCase) private _inviteCompanyTeamMemberUseCase: IInviteCompanyTeamMemberUseCase,
    @inject(TYPES.ListCompanyTeamMembersUseCase) private _listCompanyTeamMembersUseCase: IListCompanyTeamMembersUseCase
  ) { }

  createProfile = async (
    request: FastifyRequest<{ Body: CreateDeveloperProfileInput }>,
    reply: FastifyReply
  ): Promise<void> => {

    const userId = request.user?.id as string; //wont reach here is req.user is not avaible so its fine to assert
    const result = await this._createProfileUseCase.execute({
      ...request.body,
      userId,
      workHistory: request.body.workHistory ?? [],
      education: request.body.education ?? [],
      projects: request.body.projects ?? [],
    });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  createCompanyProfile = async (
    request: FastifyRequest<{ Body: CreateCompanyProfileInput }>,
    reply: FastifyReply
  ): Promise<void> => {

    const userId = request.user?.id as string;
    const result = await this._createCompanyProfileUseCase.execute({ ...request.body, userId });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  getProfile = async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const userId = request.user?.id as string;
    const role = request.user?.role;

    if (role === 'company') {
      const result = await this._getCompanyProfileUseCase.execute(userId);
      reply.status(HttpStatus.OK).send(wrapSuccess(result));
    } else if (role === 'developer') {
      const result = await this._getDeveloperProfileUseCase.execute(userId);
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

    const result = await this._updateDeveloperProfileUseCase.execute(userId, request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  updateCompanyProfile = async (
    request: FastifyRequest<{ Body: UpdateCompanyProfileInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;

    const result = await this._updateCompanyProfileUseCase.execute(userId, request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  resubmitDocuments = async (
    request: FastifyRequest<{ Body: ResubmitDocumentsInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const userId = request.user?.id as string;
    const result = await this._resubmitDocumentsUseCase.execute({
      userId,
      documents: request.body.documents
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  listCompanyTeam = async (
    request: FastifyRequest<{ Querystring: ListCompanyTeamQueryInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const companyContext = this._getCompanyContext(request);
    const companyUserId = companyContext.companyUserId;

    const { page, limit, search } = request.query;
    const result = await this._listCompanyTeamMembersUseCase.execute({
      companyUserId,
      page,
      limit,
      search,
    });
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  inviteCompanyTeamMember = async (
    request: FastifyRequest<{ Body: InviteCompanyTeamMemberInput }>,
    reply: FastifyReply
  ): Promise<void> => {
    const inviterUserId = request.user?.id as string;
    const result = await this._inviteCompanyTeamMemberUseCase.execute({
      inviterUserId,
      email: request.body.email,
      role: request.body.role,
      fullName: request.body.fullName,
      jobTitle: request.body.jobTitle,
    });
    reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
  };

  private _getCompanyContext(request: FastifyRequest) {
    const companyContext = request.companyContext;
    if (!companyContext) {
      throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
    }
    return companyContext;
  }
}

