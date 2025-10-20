import { UserRole } from '../types.js';

export interface UserProps {
  id: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  isBlocked: boolean;
  createdAt: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string;
  public readonly role: UserRole;
  public readonly isBlocked: boolean;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.isBlocked = props.isBlocked;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'isBlocked'>): Omit<UserProps, 'id'> {
    return {
      ...props,
      isBlocked: false,
      createdAt: new Date(),
    };
  }
}
