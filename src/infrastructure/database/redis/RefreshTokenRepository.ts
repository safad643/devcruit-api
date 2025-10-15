import { IRefreshTokenRepository } from '../../../domain/repositories';
import { getRedis } from './client';
import { InternalError } from '../../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class RefreshTokenRepository implements IRefreshTokenRepository {
  private getKey(tokenId: string): string {
    return `refresh:${tokenId}`;
  }

  private getUserTokensKey(userId: string): string {
    return `user:tokens:${userId}`;
  }

  async save(tokenId: string, userId: string, ttlSeconds: number): Promise<void> {
    try {
      const redis = getRedis();
      const key = this.getKey(tokenId);
      const userTokensKey = this.getUserTokensKey(userId);

      await redis
        .multi()
        .setex(key, ttlSeconds, userId) // Store userId as value (needed for delete)
        .sadd(userTokensKey, tokenId)
        .exec();
    } catch (error) {
      throw new InternalError('Failed to save refresh token to cache', error as Error);
    }
  }

  async exists(tokenId: string): Promise<boolean> {
    try {
      const redis = getRedis();
      const key = this.getKey(tokenId);
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      throw new InternalError('Failed to check refresh token existence', error as Error);
    }
  }

  async delete(tokenId: string, userId: string): Promise<void> {
    try {
      const redis = getRedis();
      const key = this.getKey(tokenId);
      const userTokensKey = this.getUserTokensKey(userId);

      await redis
        .multi()
        .del(key)
        .srem(userTokensKey, tokenId)
        .exec();
    } catch (error) {
      throw new InternalError('Failed to delete refresh token from cache', error as Error);
    }
  }

  async deleteAllForUser(userId: string): Promise<void> {
    try {
      const redis = getRedis();
      const userTokensKey = this.getUserTokensKey(userId);

      const tokenIds = await redis.smembers(userTokensKey);
      if (tokenIds.length === 0) return;

      const keys = tokenIds.map((id) => this.getKey(id));

      await redis
        .multi()
        .del(...keys)
        .del(userTokensKey)
        .exec();
    } catch (error) {
      throw new InternalError('Failed to delete user refresh tokens from cache', error as Error);
    }
  }
}
