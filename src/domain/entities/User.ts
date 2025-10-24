import { UserRole } from '../types.js';

export type AuthProvider = 'local' | 'google';

export interface UserProps {
  id: string;
  email: string;
  password: string | null;  // Changed: now nullable
  role: UserRole;
  isBlocked: boolean;
  authProviders: AuthProvider[];  // New: tracks all login methods
  googleId?: string;  // New: Google's unique user ID
  createdAt: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string | null;
  public readonly role: UserRole;
  public readonly isBlocked: boolean;
  public readonly authProviders: AuthProvider[];
  public readonly googleId?: string;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.isBlocked = props.isBlocked;
    this.authProviders = props.authProviders;
    this.googleId = props.googleId;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'isBlocked'>): Omit<UserProps, 'id'> {
    return {
      ...props,
      isBlocked: false,
      createdAt: new Date(),
    };
  }

  hasAuthProvider(provider: AuthProvider): boolean {
    return this.authProviders.includes(provider);
  }

  canLoginWithPassword(): boolean {
    return this.password !== null && this.hasAuthProvider('local');
  }
}
