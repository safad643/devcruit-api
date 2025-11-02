import { IDeveloperProfileRepository } from '../../../domain/repositories';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ListDevelopersInput, ListDevelopersOutput, DeveloperListItem } from '../../dtos/admin.dto';

@injectable()
export class ListDevelopersUseCase {
  constructor(
    @inject(TYPES.DeveloperProfileRepository) private developerProfileRepository: IDeveloperProfileRepository
  ) {}

  async execute(input: ListDevelopersInput): Promise<ListDevelopersOutput> {
    // Map input to repository filters
    const filters = {
      page: input.page,
      limit: input.limit,
      search: input.search,
      isBlocked: input.isBlocked,
      sortBy: input.sortBy,
      sortOrder: input.sortOrder,
    };

    // Call repository
    const result = await this.developerProfileRepository.listWithFilters(filters);

    // Map to output DTO with only essential fields
    const developers: DeveloperListItem[] = result.developers.map((item) => ({
      id: item.developerProfile.id,
      userId: item.developerProfile.userId,
      email: item.userEmail,
      isBlocked: item.isBlocked,
      seniorityLevel: item.developerProfile.seniorityLevel,
      yearsExperience: item.developerProfile.yearsExperience,
      employmentStatus: item.developerProfile.employmentStatus,
      createdAt: item.developerProfile.createdAt,
    }));

    return {
      developers,
      total: result.total,
      page: input.page,
      limit: input.limit,
    };
  }
}

