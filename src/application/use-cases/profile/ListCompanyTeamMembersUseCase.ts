import { inject, injectable } from 'inversify';
import { TYPES } from '../../../di/types';
import { CompanyTeamMember, ICompanyTeamRepository, ICompanyProfileRepository, IUserRepository } from '../../../domain/repositories';
import { CompanyTeamMemberDTO, IListCompanyTeamMembersUseCase, ListCompanyTeamMembersInput, PaginatedTeamMembersResponse } from './interfaces';

@injectable()
export class ListCompanyTeamMembersUseCase implements IListCompanyTeamMembersUseCase {
  constructor(
    @inject(TYPES.CompanyTeamRepository) private _companyTeamRepository: ICompanyTeamRepository,
    @inject(TYPES.CompanyProfileRepository) private _companyProfileRepository: ICompanyProfileRepository,
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository
  ) { }

  async execute(input: ListCompanyTeamMembersInput): Promise<PaginatedTeamMembersResponse> {
    const { companyUserId, page, limit, search } = input;

    // Get team members from repo (always paginated now)
    const repoResult = await this._companyTeamRepository.listMembers(companyUserId, { page, limit, search });

    // Get company owner info
    const [companyProfile, ownerUser] = await Promise.all([
      this._companyProfileRepository.findByUserId(companyUserId),
      this._userRepository.findById(companyUserId)
    ]);

    // Create owner DTO
    let ownerDTO: CompanyTeamMemberDTO | null = null;
    if (companyProfile && ownerUser) {
      ownerDTO = {
        id: companyProfile.id,
        userId: companyUserId,
        email: ownerUser.email,
        fullName: companyProfile.fullName || ownerUser.name,
        role: 'company',
        status: 'active',
        invitedAt: companyProfile.createdAt,
        activatedAt: companyProfile.createdAt,
      };
    }

    const teamMembers = repoResult.data.map(({ member, role }) => this._toDTO(member, role));

    // For first page, include owner at top
    const actualPage = repoResult.page;
    const data = (actualPage === 1 && ownerDTO) ? [ownerDTO, ...teamMembers] : teamMembers;
    const total = ownerDTO ? repoResult.total + 1 : repoResult.total;

    return {
      data,
      total,
      page: actualPage,
      limit: repoResult.limit,
      totalPages: Math.ceil(total / repoResult.limit),
    };
  }

  private _toDTO(member: CompanyTeamMember, role: 'hr' | 'interviewer'): CompanyTeamMemberDTO {
    return {
      id: member.id,
      userId: member.userId,
      email: member.email,
      fullName: member.fullName,
      jobTitle: member.jobTitle,
      role: role,
      status: member.status,
      invitedAt: member.invitedAt,
      activatedAt: member.activatedAt,
    };
  }
}
