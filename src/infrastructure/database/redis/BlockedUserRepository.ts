import { getRedis } from './client';
import { InternalError } from '../../../domain/errors';
import { IBlockedUserRepository } from '../../../domain/repositories';
import { injectable } from 'inversify';

@injectable()
export class BlockedUserRepository implements IBlockedUserRepository {
    private readonly BLOCKED_SET_KEY = 'blocked:users';

    async add(userId: string): Promise<void> {
        try {
            const redis = getRedis();
            await redis.sadd(this.BLOCKED_SET_KEY, userId);
        } catch (error) {
            throw new InternalError('Failed to add user to blocked set', error as Error);
        }
    }

    async remove(userId: string): Promise<void> {
        try {
            const redis = getRedis();
            await redis.srem(this.BLOCKED_SET_KEY, userId);
        } catch (error) {
            throw new InternalError('Failed to remove user from blocked set', error as Error);
        }
    }

    async isBlocked(userId: string): Promise<boolean> {
        try {
            const redis = getRedis();
            const result = await redis.sismember(this.BLOCKED_SET_KEY, userId);
            return result === 1;
        } catch (error) {
            throw new InternalError('Failed to check if user is blocked', error as Error);
        }
    }
}
