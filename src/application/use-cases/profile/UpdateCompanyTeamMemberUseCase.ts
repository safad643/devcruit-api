import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import {
    CompanyTeamMember,
    ICompanyTeamRepository,
    ICompanyProfileRepository,
} from '../../../domain/repositories';
import { CompanyTeamMemberDTO, IUpdateCompanyTeamMemberUseCase, UpdateCompanyTeamMemberInput } from './interfaces';
import { ForbiddenError, NotFoundError } from '../../../domain/errors';

@injectable()
export class UpdateCompanyTeamMemberUseCase implements IUpdateCompanyTeamMemberUseCase {
    constructor(
        @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository,
        @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository
    ) { }

    async execute(input: UpdateCompanyTeamMemberInput): Promise<CompanyTeamMemberDTO> {
        // Verify company owns this team member
        const teamMember = await this._companyTeamRepository.findById(input.teamMemberId);
        if (!teamMember) {
            throw new NotFoundError('Team member not found');
        }

        if (teamMember.member.companyId !== input.companyUserId) {
            throw new ForbiddenError('You do not have permission to update this team member');
        }

        // Cannot edit the company owner
        if (teamMember.role === 'company' as any) {
            throw new ForbiddenError('Cannot edit the company owner');
        }

        const updatedMember = await this._companyTeamRepository.updateMember(input.teamMemberId, {
            fullName: input.fullName,
            jobTitle: input.jobTitle,
        });

        return this._toDTO(updatedMember, teamMember.role);
    }

    private _toDTO(member: CompanyTeamMember, role: 'hr' | 'interviewer'): CompanyTeamMemberDTO {
        return {
            id: member.id,
            userId: member.userId,
            email: member.email,
            fullName: member.fullName,
            role: role,
            status: member.status,
            invitedAt: member.invitedAt,
            activatedAt: member.activatedAt,
        };
    }
}
