import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { CompanyTeamMember, ICompanyTeamRepository } from '../../../domain/repositories';
import { CompanyTeamMemberDTO, IListCompanyTeamMembersUseCase } from './interfaces';

@injectable()
export class ListCompanyTeamMembersUseCase implements IListCompanyTeamMembersUseCase {
  constructor(
    @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository
  ) {}

  async execute(companyUserId: string): Promise<CompanyTeamMemberDTO[]> {
    const membersWithRole = await this._companyTeamRepository.listMembers(companyUserId);
    return membersWithRole.map(({ member, role }) => this._toDTO(member, role));
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

