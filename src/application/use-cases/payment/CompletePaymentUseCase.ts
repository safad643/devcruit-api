import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ICompanyProfileRepository } from '../../../domain/repositories';
import { PlanTier } from '../../../domain/entities/CompanyProfile';
import { InternalError, NotFoundError } from '../../../domain/errors';

export interface CompletePaymentInput {
  userId: string;
  plan: PlanTier;
}

@injectable()
export class CompletePaymentUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private companyRepo: ICompanyProfileRepository
  ) {}

  async execute(input: CompletePaymentInput): Promise<void> {
    const profile = await this.companyRepo.findByUserId(input.userId);
    if (!profile) {
      throw new NotFoundError('Company profile not found');
    }

    const newHistory = [...(profile.planHistory ?? []), { plan: input.plan, startDate: new Date() }];

    const updated = await this.companyRepo.update(input.userId, {
      status: 'paid',
      planHistory: newHistory
    } as any);

    if (!updated) {
      throw new InternalError('Failed to update company profile after payment');
    }
  }
}


