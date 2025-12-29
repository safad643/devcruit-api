import { IGenericRepository } from './IGenericRepository';
import { PaymentTransaction, PaymentTransactionProps } from '../entities/PaymentTransaction';

export type CreatePaymentTransactionData = Omit<PaymentTransactionProps, 'id' | 'createdAt'>;

export interface RevenueTrendItem {
    date: string;
    amount: number;
}

export interface IPaymentTransactionRepository extends IGenericRepository<PaymentTransaction, CreatePaymentTransactionData, never> {
    findByUserId(userId: string): Promise<PaymentTransaction[]>;
    findByCompanyId(companyId: string): Promise<PaymentTransaction[]>;
    findByStripeSessionId(sessionId: string): Promise<PaymentTransaction | null>;
    getRevenueTrend(days: number): Promise<RevenueTrendItem[]>;
    getTotalRevenue(): Promise<number>;
}

