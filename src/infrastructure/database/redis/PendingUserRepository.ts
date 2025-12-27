import { IPendingUserRepository } from '../../../domain/repositories';
import { PendingUserData } from '../../../domain/types';
import { getRedis } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class PendingUserRepository implements IPendingUserRepository {
  private _getKey(email: string): string {
    return `pending:user:${email}`;
  }

  async save(email: string, data: PendingUserData, ttlSeconds: number): Promise<void> {
    try {
      const redis = getRedis();
      const key = this._getKey(email);
      await redis.setex(key, ttlSeconds, JSON.stringify(data));
    } catch (error) {
      throw new InternalError('Failed to save pending user to cache', error as Error);
    }
  }

  async findByEmail(email: string): Promise<PendingUserData | null> {
    try {
      const redis = getRedis();
      const key = this._getKey(email);
      const data = await redis.get(key);
      
      if (!data) return null;
      return JSON.parse(data) as PendingUserData;
    } catch (error) {
      throw new InternalError('Failed to retrieve pending user from cache', error as Error);
    }
  }

  async delete(email: string): Promise<void> {
    try {
      const redis = getRedis();
      const key = this._getKey(email);
      await redis.del(key);
    } catch (error) {
      throw new InternalError('Failed to delete pending user from cache', error as Error);
    }
  }
}
