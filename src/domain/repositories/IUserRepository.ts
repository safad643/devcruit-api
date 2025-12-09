import { User, UserProps } from '../entities/User';
import { IGenericRepository } from './IGenericRepository';

export type CreateUserProps = Omit<UserProps, 'id'>;
export type UpdateUserProps = Partial<UserProps>;

export interface IUserRepository extends IGenericRepository<User, CreateUserProps, UpdateUserProps> {
  findByEmail(email: string): Promise<User | null>;
  findByGoogleId(googleId: string): Promise<User | null>;
}
