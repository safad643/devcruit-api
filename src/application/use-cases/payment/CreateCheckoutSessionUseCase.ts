import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { IPaymentService } from '../../services';
import { IPlanRepository } from '../../../domain/repositories/IPlanRepository';
import { CreateCheckoutSessionInput, CreateCheckoutSessionOutput } from '../../dtos/payment.dto';
import { NotFoundError } from '../../../domain/errors';

@injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService,
    @inject(TYPES.PlanRepository) private _planRepository: IPlanRepository
  ) { }

  async execute(input: CreateCheckoutSessionInput): Promise<CreateCheckoutSessionOutput> {
    // Fetch the plan from database
    const plan = await this._planRepository.findById(input.planId);
    if (!plan || !plan.isActive) {
      throw new NotFoundError('Plan not found or inactive');
    }

    const finalPrice = plan.getFinalPrice();

    const result = await this._paymentService.createCheckoutSession({
      planId: plan.id,
      planName: plan.name,
      amount: finalPrice,
      userId: input.userId,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
    });

    return { sessionId: result.sessionId, url: result.url };
  }
}
