import { OTPType } from '../types';

export interface IOTPRepository {
  save(email: string, otpCode: string, type: OTPType, ttlSeconds: number): Promise<void>;
  find(email: string, type: OTPType): Promise<string | null>;
  delete(email: string, type: OTPType): Promise<void>;
  incrementResendCount(email: string, type: OTPType, ttlSeconds: number): Promise<number>;
}
