import { injectable, inject } from 'inversify';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TYPES } from '../../di/types';
import {
    IExtendOfferUseCase,
    IAcceptOfferUseCase,
    IDeclineOfferUseCase,
} from '../../application/use-cases/application/interfaces';
import {
    ICreateOfferLetterUseCase,
    IGetOfferLetterUseCase,
} from '../../application/use-cases/offer-letter/interfaces';
import {
    ExtendOfferInput,
    DeclineOfferInput,
    CreateOfferLetterInput
} from '../schemas/application.schema';
import { wrapSuccess } from '../../utils/response';
import { HttpStatus } from '../../utils/statusCodes';
import { ForbiddenError } from '../../domain/errors';

@injectable()
export class OfferController {
    constructor(
        @inject(TYPES.ExtendOfferUseCase) private extendOfferUseCase: IExtendOfferUseCase,
        @inject(TYPES.AcceptOfferUseCase) private acceptOfferUseCase: IAcceptOfferUseCase,
        @inject(TYPES.DeclineOfferUseCase) private declineOfferUseCase: IDeclineOfferUseCase,
        @inject(TYPES.CreateOfferLetterUseCase) private createOfferLetterUseCase: ICreateOfferLetterUseCase,
        @inject(TYPES.GetOfferLetterUseCase) private getOfferLetterUseCase: IGetOfferLetterUseCase
    ) { }

    // Company endpoint: Extend offer
    extendOffer = async (
        request: FastifyRequest<{ Params: { id: string }; Body?: ExtendOfferInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const companyContext = this.getCompanyContext(request);
        const companyId = companyContext.companyUserId;
        const applicationId = request.params.id;
        const note = request.body?.note?.trim() || undefined;
        const result = await this.extendOfferUseCase.execute({
            applicationId,
            companyId,
            note,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Developer endpoint: Accept offer
    acceptOffer = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<void> => {
        const developerId = request.user?.id as string;
        const applicationId = request.params.id;
        const result = await this.acceptOfferUseCase.execute({
            applicationId,
            developerId,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Developer endpoint: Decline offer
    declineOffer = async (
        request: FastifyRequest<{ Params: { id: string }; Body?: DeclineOfferInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const developerId = request.user?.id as string;
        const applicationId = request.params.id;
        const note = request.body?.note?.trim() || undefined;
        const result = await this.declineOfferUseCase.execute({
            applicationId,
            developerId,
            note,
        });
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Company endpoint: Create offer letter
    createOfferLetter = async (
        request: FastifyRequest<{ Params: { id: string }; Body: CreateOfferLetterInput }>,
        reply: FastifyReply
    ): Promise<void> => {
        const companyContext = this.getCompanyContext(request);
        const companyId = companyContext.companyUserId;
        const applicationId = request.params.id;
        const result = await this.createOfferLetterUseCase.execute({
            applicationId,
            companyId,
            ...request.body,
        });
        reply.status(HttpStatus.CREATED).send(wrapSuccess(result));
    };

    // Company endpoint: Get offer letter
    getOfferLetterForCompany = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<void> => {
        const companyContext = this.getCompanyContext(request);
        const companyId = companyContext.companyUserId;
        const applicationId = request.params.id;
        const result = await this.getOfferLetterUseCase.execute(applicationId, companyId, 'company');
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    // Developer endpoint: Get offer letter
    getOfferLetterForDeveloper = async (
        request: FastifyRequest<{ Params: { id: string } }>,
        reply: FastifyReply
    ): Promise<void> => {
        const developerId = request.user?.id as string;
        const applicationId = request.params.id;
        const result = await this.getOfferLetterUseCase.execute(applicationId, developerId, 'developer');
        reply.status(HttpStatus.OK).send(wrapSuccess(result));
    };

    private getCompanyContext(request: FastifyRequest) {
        const companyContext = request.companyContext;
        if (!companyContext) {
            throw new ForbiddenError('Company context missing. Ensure checkCompanyPaid middleware is applied.');
        }
        return companyContext;
    }
}
