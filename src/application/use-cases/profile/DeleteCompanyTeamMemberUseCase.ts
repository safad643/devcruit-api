import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import {
    ICompanyTeamRepository,
    IUserRepository,
} from '../../../domain/repositories';
import { IDeleteCompanyTeamMemberUseCase, DeleteCompanyTeamMemberInput } from './interfaces';
import { ForbiddenError, NotFoundError } from '../../../domain/errors';

@injectable()
export class DeleteCompanyTeamMemberUseCase implements IDeleteCompanyTeamMemberUseCase {
    constructor(
        @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository,
        @inject(TYPES.UserRepository) private _userRepository: IUserRepository
    ) { }

    async execute(input: DeleteCompanyTeamMemberInput): Promise<void> {
        // Verify company owns this team member
        const teamMember = await this._companyTeamRepository.findById(input.teamMemberId);
        if (!teamMember) {
            throw new NotFoundError('Team member not found');
        }

        if (teamMember.member.companyId !== input.companyUserId) {
            throw new ForbiddenError('You do not have permission to delete this team member');
        }

        // Cannot delete the company owner
        if (teamMember.role === 'company' as any) {
            throw new ForbiddenError('Cannot delete the company owner');
        }

        // Delete the associated user account if exists
        if (teamMember.member.userId) {
            await this._userRepository.delete(teamMember.member.userId);
        }

        // Delete the team member record
        await this._companyTeamRepository.deleteMember(input.teamMemberId);
    }
}
