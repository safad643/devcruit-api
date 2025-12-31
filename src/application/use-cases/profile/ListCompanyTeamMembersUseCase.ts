import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { CompanyTeamMember, ICompanyTeamRepository, ICompanyProfileRepository, IUserRepository } from '../../../domain/repositories';
import { CompanyTeamMemberDTO, IListCompanyTeamMembersUseCase } from './interfaces';

@injectable()
export class ListCompanyTeamMembersUseCase implements IListCompanyTeamMembersUseCase {
  constructor(
    @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository
  ) { }

  async execute(companyUserId: string): Promise<CompanyTeamMemberDTO[]> {
    // Get HR and Interviewers
    const membersWithRole = await this._companyTeamRepository.listMembers(companyUserId);
    const teamMembers = membersWithRole.map(({ member, role }) => this._toDTO(member, role));

    // Get company owner info
    const [companyProfile, ownerUser] = await Promise.all([
      this._companyProfileRepository.findByUserId(companyUserId),
      this._userRepository.findById(companyUserId)
    ]);

    // Add company owner to the list
    if (companyProfile && ownerUser) {
      const ownerDTO: CompanyTeamMemberDTO = {
        id: companyProfile.id,
        userId: companyUserId,
        email: ownerUser.email,
        fullName: companyProfile.fullName || ownerUser.name,
        role: 'company',
        status: 'active',
        invitedAt: companyProfile.createdAt,
        activatedAt: companyProfile.createdAt,
      };
      return [ownerDTO, ...teamMembers];
    }

    return teamMembers;
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
