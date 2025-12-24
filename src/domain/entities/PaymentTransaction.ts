import { PlanLimits } from './Plan';

export type PaymentStatus = 'completed' | 'failed' | 'pending';

export interface PlanSnapshot {
    planName: string;
    price: number;
    finalPrice: number;
    durationMonths: number;
    limits: PlanLimits;
}

export interface PaymentTransactionProps {
    id: string;
    userId: string;
    companyId: string;
    planSnapshot: PlanSnapshot;
    stripeSessionId: string;
    stripePaymentIntentId?: string;
    status: PaymentStatus;
    paidAt: Date;
    createdAt: Date;
}

export class PaymentTransaction {
    public readonly id: string;
    public readonly userId: string;
    public readonly companyId: string;
    public readonly planSnapshot: PlanSnapshot;
    public readonly stripeSessionId: string;
    public readonly stripePaymentIntentId?: string;
    public readonly status: PaymentStatus;
    public readonly paidAt: Date;
    public readonly createdAt: Date;

    constructor(props: PaymentTransactionProps) {
        this.id = props.id;
        this.userId = props.userId;
        this.companyId = props.companyId;
        this.planSnapshot = props.planSnapshot;
        this.stripeSessionId = props.stripeSessionId;
        this.stripePaymentIntentId = props.stripePaymentIntentId;
        this.status = props.status;
        this.paidAt = props.paidAt;
        this.createdAt = props.createdAt;
    }

    static create(
        props: Omit<PaymentTransactionProps, 'id' | 'createdAt'>
    ): Omit<PaymentTransactionProps, 'id'> {
        return {
            ...props,
            createdAt: new Date(),
        };
    }
}
