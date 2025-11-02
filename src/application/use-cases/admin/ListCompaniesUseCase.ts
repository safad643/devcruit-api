import { ICompanyProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ListCompaniesInput, ListCompaniesOutput, CompanyListItem } from '../../dtos/admin.dto';

@injectable()
export class ListCompaniesUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private companyProfileRepository: ICompanyProfileRepository
  ) {}

  async execute(input: ListCompaniesInput): Promise<ListCompaniesOutput> {
    // Map input to repository filters
    const filters = {
      page: input.page,
      limit: input.limit,
      search: input.search,
      searchField: input.search ? ('email' as const) : undefined,
      status: input.status && input.status !== 'all' ? input.status : undefined,
      isBlocked: input.isBlocked,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    // Call repository
    const result = await this.companyProfileRepository.listWithFilters(filters);

    // Map to output DTO with only essential fields
    const companies: CompanyListItem[] = result.companies.map((item) => ({
      id: item.companyProfile.id,
      userId: item.companyProfile.userId,
      companyName: item.companyProfile.companyName,
      email: item.userEmail,
      fullName: item.companyProfile.fullName,
      phoneNumber: item.companyProfile.phoneNumber,
      status: item.companyProfile.status,
      isBlocked: item.isBlocked,
      createdAt: item.companyProfile.createdAt,
    }));

    return {
      companies,
      total: result.total,
      page: input.page,
      limit: input.limit,
    };
  }
}

