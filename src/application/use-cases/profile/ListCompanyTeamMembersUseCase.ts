import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { CompanyTeamMember, ICompanyTeamRepository } from '../../../domain/repositories';
import { CompanyTeamMemberDTO, IListCompanyTeamMembersUseCase } from './interfaces/IListCompanyTeamMembersUseCase';
import { HRProfile } from '../../../domain/entities/HRProfile';

@injectable()
export class ListCompanyTeamMembersUseCase implements IListCompanyTeamMembersUseCase {
  constructor(
    @inject(TYPES.CompanyTeamRepository) private companyTeamRepository: ICompanyTeamRepository
  ) {}

  async execute(companyUserId: string): Promise<CompanyTeamMemberDTO[]> {
    const members = await this.companyTeamRepository.listMembers(companyUserId);
    return members.map((member) => this.toDTO(member));
  }

  private toDTO(member: CompanyTeamMember): CompanyTeamMemberDTO {
    return {
      id: member.id,
      userId: member.userId,
      email: member.email,
      fullName: member.fullName,
      role: member instanceof HRProfile ? 'hr' : 'interviewer',
      status: member.status,
      invitedAt: member.invitedAt,
      activatedAt: member.activatedAt,
    };
  }
}

