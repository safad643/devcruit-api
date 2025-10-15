import { PendingUserData } from '../types' ;

export interface IPendingUserRepository {
  save(email: string, data: PendingUserData, ttlSeconds: number): Promise<void>;
  findByEmail(email: string): Promise<PendingUserData | null>;
  delete(email: string): Promise<void>;
}
