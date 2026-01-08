import { User, UserProps } from '../entities/User';
import { IGenericRepository } from './IGenericRepository';

export type CreateUserProps = Omit<UserProps, 'id'>;
export type UpdateUserProps = Partial<UserProps>;

export interface UserStats {
  total: number;
  developers: number;
  companies: number;
  blocked: number;
}

export interface SignupTrendItem {
  date: string;
  developers: number;
  companies: number;
}

export interface IUserRepository extends IGenericRepository<User, CreateUserProps, UpdateUserProps> {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
  getUserStats(): Promise<UserStats>;
  getSignupTrend(days: number): Promise<SignupTrendItem[]>;
  findBlockedUserIds(): Promise<string[]>;
}

