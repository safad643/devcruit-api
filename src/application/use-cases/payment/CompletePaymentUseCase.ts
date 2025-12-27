import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ICompanyProfileRepository, IPlanRepository, IPaymentTransactionRepository } from '../../../domain/repositories';
import { CompanyProfileProps, PlanHistoryItem } from '../../../domain/entities/CompanyProfile';
import { InternalError, NotFoundError } from '../../../domain/errors';
import { CompletePaymentInput } from '../../dtos/payment.dto';

export interface CompletePaymentWithSessionInput extends CompletePaymentInput {
  stripeSessionId: string;
}

@injectable()
export class CompletePaymentUseCase {
  constructor(
    @inject(TYPES.CompanyProfileRepository) private _companyRepo: ICompanyProfileRepository,
    @inject(TYPES.PlanRepository) private _planRepo: IPlanRepository,
    @inject(TYPES.PaymentTransactionRepository) private _txRepo: IPaymentTransactionRepository
  ) { }

  async execute(input: CompletePaymentWithSessionInput): Promise<void> {
    // Fetch the plan from database
    const plan = await this._planRepo.findById(input.planId);
    if (!plan) {
      throw new NotFoundError('Plan not found');
    }

    // Fetch company profile
    const profile = await this._companyRepo.findByUserId(input.userId);
    if (!profile) {
      throw new NotFoundError('Company profile not found');
    }

    const now = new Date();

    // Calculate final price and snapshot
    const planSnapshot = plan.toSnapshot();

    // Close any existing active plan (set endDate to now for early termination)
    const updatedHistory = (profile.planHistory ?? []).map(p =>
      p.endDate && new Date(p.endDate) > now ? { ...p, endDate: now } : p
    );

    // Calculate expiry date
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + plan.durationMonths);

    // Add new plan as pure snapshot (no planId reference)
    const newHistoryItem: PlanHistoryItem = {
      planName: planSnapshot.planName,
      price: planSnapshot.price,
      finalPrice: planSnapshot.finalPrice,
      durationMonths: planSnapshot.durationMonths,
      limits: planSnapshot.limits,
      startDate: now,
      endDate,
    };
    updatedHistory.push(newHistoryItem);

    // Update company profile using the profile's document ID, not userId
    const updated = await this._companyRepo.update(profile.id, {
      planHistory: updatedHistory
    } as Partial<CompanyProfileProps>);

    if (!updated) {
      throw new InternalError('Failed to update company profile after payment');
    }

    // Create payment transaction record
    await this._txRepo.create({
      userId: input.userId,
      companyId: profile.id,
      planSnapshot,
      stripeSessionId: input.stripeSessionId,
      status: 'completed',
      paidAt: now,
    });
  }
}
