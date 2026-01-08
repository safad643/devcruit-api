import { container } from '../../di/container';
import { TYPES } from '../../di/types';
import { IUserRepository, IBlockedUserRepository } from '../../domain/repositories';

/**
 * Syncs blocked users from MongoDB to Redis on server startup.
 * This ensures Redis has the latest blocked user data even after a restart.
 */
export async function syncBlockedUsersToRedis(): Promise<void> {
    try {
        const userRepository = container.get<IUserRepository>(TYPES.UserRepository);
        const blockedUserRepository = container.get<IBlockedUserRepository>(TYPES.BlockedUserRepository);

        const blockedUserIds = await userRepository.findBlockedUserIds();

        for (const userId of blockedUserIds) {
            await blockedUserRepository.add(userId);
        }

        console.log(`Synced ${blockedUserIds.length} blocked users to Redis`);
    } catch (error) {
        console.error('Failed to sync blocked users to Redis:', error);
        // Don't throw - let the server continue even if sync fails
    }
}
