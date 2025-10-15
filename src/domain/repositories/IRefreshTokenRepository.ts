export interface IRefreshTokenRepository {
  save(tokenId: string, userId: string, ttlSeconds: number): Promise<void>;
  exists(tokenId: string): Promise<boolean>;
  delete(tokenId: string, userId: string): Promise<void>;
  deleteAllForUser(userId: string): Promise<void>;
}
