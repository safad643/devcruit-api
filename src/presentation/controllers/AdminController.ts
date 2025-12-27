import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
  IBlockUserUseCase,
  IUnblockUserUseCase,
  IApproveCompanyUseCase,
  IRejectCompanyUseCase,
  IListCompaniesUseCase,
  IListDevelopersUseCase,
} from '../../application/use-cases/admin/interfaces';
import {
  BlockUserInput,
  UnblockUserInput,
  ApproveCompanyInput,
  RejectCompanyInput,
  ListCompaniesInput,
  ListDevelopersInput
} from '../schemas/admin.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';

@injectable()
export class AdminController {
  constructor(
    @inject(TYPES.BlockUserUseCase) private _blockUserUseCase: IBlockUserUseCase,
    @inject(TYPES.UnblockUserUseCase) private _unblockUserUseCase: IUnblockUserUseCase,
    @inject(TYPES.ApproveCompanyUseCase) private _approveCompanyUseCase: IApproveCompanyUseCase,
    @inject(TYPES.RejectCompanyUseCase) private _rejectCompanyUseCase: IRejectCompanyUseCase,
    @inject(TYPES.ListCompaniesUseCase) private _listCompaniesUseCase: IListCompaniesUseCase,
    @inject(TYPES.ListDevelopersUseCase) private _listDevelopersUseCase: IListDevelopersUseCase
  ) { }

  blockUser = async (request: FastifyRequest<{ Body: BlockUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._blockUserUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  unblockUser = async (request: FastifyRequest<{ Body: UnblockUserInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._unblockUserUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  approveCompany = async (request: FastifyRequest<{ Body: ApproveCompanyInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._approveCompanyUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  rejectCompany = async (request: FastifyRequest<{ Body: RejectCompanyInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._rejectCompanyUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  listCompanies = async (request: FastifyRequest<{ Body: ListCompaniesInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._listCompaniesUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };

  listDevelopers = async (request: FastifyRequest<{ Body: ListDevelopersInput }>, reply: FastifyReply): Promise<void> => {
    const result = await this._listDevelopersUseCase.execute(request.body);
    reply.status(HttpStatus.OK).send(wrapSuccess(result));
  };
}

