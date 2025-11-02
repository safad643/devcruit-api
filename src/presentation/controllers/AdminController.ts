import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { 
  BlockUserUseCase,
  UnblockUserUseCase,
  ApproveCompanyUseCase,
  RejectCompanyUseCase,
  ListCompaniesUseCase,
  ListDevelopersUseCase
} from '../../application/use-cases/admin';
import {
  BlockUserInput,
  UnblockUserInput,
  ApproveCompanyInput,
  RejectCompanyInput,
  ListCompaniesInput,
  ListDevelopersInput
} from '../schemas/admin.schema';

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.BlockUserUseCase) private blockUserUseCase: BlockUserUseCase,
    @inject(TYPES.UnblockUserUseCase) private unblockUserUseCase: UnblockUserUseCase,
    @inject(TYPES.ApproveCompanyUseCase) private approveCompanyUseCase: ApproveCompanyUseCase,
    @inject(TYPES.RejectCompanyUseCase) private rejectCompanyUseCase: RejectCompanyUseCase,
    @inject(TYPES.ListCompaniesUseCase) private listCompaniesUseCase: ListCompaniesUseCase,
    @inject(TYPES.ListDevelopersUseCase) private listDevelopersUseCase: ListDevelopersUseCase
  ) {}

  blockUser = async (request: FastifyRequest<{ Body: BlockUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.blockUserUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  unblockUser = async (request: FastifyRequest<{ Body: UnblockUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.unblockUserUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  approveCompany = async (request: FastifyRequest<{ Body: ApproveCompanyInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.approveCompanyUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  rejectCompany = async (request: FastifyRequest<{ Body: RejectCompanyInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.rejectCompanyUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  listCompanies = async (request: FastifyRequest<{ Body: ListCompaniesInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.listCompaniesUseCase.execute(request.body);
    reply.status(200).send(result);
  };

  listDevelopers = async (request: FastifyRequest<{ Body: ListDevelopersInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this.listDevelopersUseCase.execute(request.body);
    reply.status(200).send(result);
  };
}

