// src/presentation/controllers/DashboardController.ts
import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import { IGetCompanyDashboardUseCase, IGetAdminDashboardUseCase } from '../../application/use-cases/dashboard/interfaces';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { ForbiddenError } from '../../domain/errors';

@injectable()
export class DashboardController {
    constructor(
        @inject(TYPES.GetCompanyDashboardUseCase) private _getCompanyDashboardUseCase: IGetCompanyDashboardUseCase,
        @inject(TYPES.GetAdminDashboardUseCase) private _getAdminDashboardUseCase: IGetAdminDashboardUseCase
    ) { }

    getCompanyDashboard = async (
        request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        const companyContext = this._getCompanyContext(request);
        const companyId = companyContext.companyUserId;

        const result = await this._getCompanyDashboardUseCase.execute(companyId);
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    getAdminDashboard = async (
        _request: FastifyRequest,
        reply: FastifyReply
    ): Promise<void> => {
        const result = await this._getAdminDashboardUseCase.execute();
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    private _getCompanyContext(request: FastifyRequest) {
        const companyContext = request.companyContext;
        if (!companyContext) {
            throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
        }
        return companyContext;
    }
}

