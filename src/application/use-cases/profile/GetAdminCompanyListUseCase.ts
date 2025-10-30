import { ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { GetAdminCompanyListInput, GetAdminCompanyListOutput, AdminCompanyListItem } from '../../dtos/profile.dto';

@injectable()
export class GetAdminCompanyListUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
  ) {}

  async execute(input: GetAdminCompanyListInput): Promise<GetAdminCompanyListOutput> {
    const result = await this.companyProfileRepository.listWithFilters({
      page: input.page,
      limit: input.limit,
      search: input.search,
      searchField: input.searchField,
      status: input.status,
      companySize: input.companySize,
      isVerified: input.isVerified,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    });

    const data: AdminCompanyListItem[] = result.companies.map(item => ({
      id: item.companyProfile.id,
      userId: item.companyProfile.userId,
      companyName: item.companyProfile.companyName,
      fullName: item.companyProfile.fullName,
      phoneNumber: item.companyProfile.phoneNumber,
      companyWebsite: item.companyProfile.companyWebsite,
      companySize: item.companyProfile.companySize,
      businessRegistrationNumber: item.companyProfile.businessRegistrationNumber,
      businessAddress: item.companyProfile.businessAddress,
      isVerified: item.companyProfile.isVerified,
      userEmail: item.userEmail,
      isBlocked: item.isBlocked,
      lastDocumentSubmitted: item.companyProfile.lastDocumentSubmitted,
      documentReuploadRequestsCount: item.companyProfile.documentReuploadRequests.length,
      planHistoryCount: item.companyProfile.planHistory.length,
      createdAt: item.companyProfile.createdAt,
      updatedAt: item.companyProfile.updatedAt,
    }));

    const totalPages = Math.ceil(result.total / input.limit);

    return {
      data,
      page: input.page,
      limit: input.limit,
      total: result.total,
      totalPages,
    };
  }
}
