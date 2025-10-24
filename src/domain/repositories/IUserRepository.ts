import { User, UserProps, AuthProvider } from '../entities/User';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  create(user: Omit<UserProps, 'id'>): Promise<User>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  linkGoogleAccount(userId: string, googleId: string): Promise<void>;
  addAuthProvider(userId: string, provider: AuthProvider): Promise<void>;
}
