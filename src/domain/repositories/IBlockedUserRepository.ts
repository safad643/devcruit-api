export interface IBlockedUserRepository {
    add(userId: string): Promise<void>;
    remove(userId: string): Promise<void>;
    isBlocked(userId: string): Promise<boolean>;
}
