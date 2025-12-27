import { IOTPRepository } from '../../../domain/repositories';
import { OTPType } from '../../../domain/types';
import { getRedis } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class OTPRepository implements IOTPRepository {
  private _getKey(email: string, type: OTPType): string {
    return `otp:${type}:${email}`;
  }

  private _getResendKey(email: string, type: OTPType): string {
    return `otp:resend:${type}:${email}`;
  }

  async save(email: string, otpCode: string, type: OTPType, ttlSeconds: number): Promise<void> {
    try {
      const redis = getRedis();
      const key = this._getKey(email, type);
      await redis.setex(key, ttlSeconds, otpCode);
    } catch (error) {
      throw new InternalError('Failed to save OTP to cache', error as Error);
    }
  }

  async find(email: string, type: OTPType): Promise<string | null> {
    try {
      const redis = getRedis();
      const key = this._getKey(email, type);
      return await redis.get(key);
    } catch (error) {
      throw new InternalError('Failed to retrieve OTP from cache', error as Error);
    }
  }

  async delete(email: string, type: OTPType): Promise<void> {
    try {
      const redis = getRedis();
      const key = this._getKey(email, type);
      await redis.del(key);
    } catch (error) {
      throw new InternalError('Failed to delete OTP from cache', error as Error);
    }
  }

  async incrementResendCount(email: string, type: OTPType, ttlSeconds: number): Promise<number> {
    try {
      const redis = getRedis();
      const key = this._getResendKey(email, type);
      
      const count = await redis.incr(key);
      
      if (count === 1) {
        await redis.expire(key, ttlSeconds);
      }
      
      return count;
    } catch (error) {
      throw new InternalError('Failed to increment resend counter', error as Error);
    }
  }
}
