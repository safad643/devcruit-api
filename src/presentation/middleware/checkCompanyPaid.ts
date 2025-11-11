import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ICompanyProfileRepository } from '../../domain/repositories';
import { ForbiddenError, UnauthorizedError, NotFoundError } from '../../domain/errors';

export async function checkCompanyPaid(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    if (request.user.role !== 'company') {
      throw new ForbiddenError('Only company users can access this endpoint');
    }

    const companyProfileRepository = container.get<ICompanyProfileRepository>(
      TYPES.CompanyProfileRepository
    );

    const companyProfile = await companyProfileRepository.findByUserId(request.user.id);

    if (!companyProfile) {
      throw new NotFoundError('Company profile not found');
    }

    if (companyProfile.status !== 'paid') {
      throw new ForbiddenError('Company must have a paid subscription to access this feature');
    }

    // Attach company profile to request for use in controllers if needed
    (request as any).companyProfile = companyProfile;
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError || error instanceof NotFoundError) {
      throw error;
    }
    throw new ForbiddenError('Failed to verify company payment status');
  }
}

