import { FastifyRequest, FastifyReply } from 'fastify';
import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { ICompanyProfileRepository, ICompanyTeamRepository, CompanyTeamMember } from '../../domain/repositories';
import { ForbiddenError, UnauthorizedError, NotFoundError } from '../../domain/errors';

export async function checkCompanyPaid(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    if (!request.user) {
      throw new UnauthorizedError('Authentication required');
    }

    const companyProfileRepository = container.get<ICompanyProfileRepository>(TYPES.CompanyProfileRepository);
    const companyTeamRepository = container.get<ICompanyTeamRepository>(TYPES.CompanyTeamRepository);

    let companyProfileUserId: string | null = null;
    let teamMemberId: string | undefined;
    let teamMemberRole: 'hr' | 'interviewer' | undefined;
    let teamMember: CompanyTeamMember | undefined;

    if (request.user.role === 'company') {
      companyProfileUserId = request.user.id;
    } else if (request.user.role === 'hr' || request.user.role === 'interviewer') {
      const foundMember = await companyTeamRepository.findByUserId(request.user.id);
      if (!foundMember || foundMember.status !== 'active') {
        throw new ForbiddenError('You do not have access to this company resources');
      }
      companyProfileUserId = foundMember.companyId;
      teamMemberId = foundMember.id;
      teamMemberRole = request.user.role;
      teamMember = foundMember;
    } else {
      throw new ForbiddenError('Only company and HR accounts can access this endpoint');
    }

    if (!companyProfileUserId) {
      throw new UnauthorizedError('Unable to resolve company context');
    }

    const companyProfile = await companyProfileRepository.findByUserId(companyProfileUserId);

    if (!companyProfile) {
      throw new NotFoundError('Company profile not found');
    }

    if (companyProfile.status !== 'paid') {
      throw new ForbiddenError('Company must have a paid subscription to access this feature');
    }

    request.companyContext = {
      companyProfile,
      companyUserId: companyProfile.userId,
      teamMemberId,
      teamMemberRole,
      teamMember,
    };
  } catch (error) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError || error instanceof NotFoundError) {
      throw error;
    }
    throw new ForbiddenError('Failed to verify company payment status');
  }
}

