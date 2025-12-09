import { UserRole } from '../types.js';

export type AuthProvider = 'local' | 'google';

export interface UserProps {
  id: string;
  email: string;
  name: string;
  password: string | null;
  role: UserRole;
  isBlocked: boolean;
  isProfileCompleted: boolean;
  authProviders: AuthProvider[];
  googleId?: string;
  createdAt: Date;
}

export class User {
  public readonly id: string;
  public readonly email: string;
  public readonly name: string;
  public readonly password: string | null;
  public readonly role: UserRole;
  public readonly isBlocked: boolean;
  public readonly isProfileCompleted: boolean;
  public readonly authProviders: AuthProvider[];
  public readonly googleId?: string;
  public readonly createdAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.email = props.email;
    this.name = props.name;
    this.password = props.password;
    this.role = props.role;
    this.isBlocked = props.isBlocked;
    this.isProfileCompleted = props.isProfileCompleted;
    this.authProviders = props.authProviders;
    this.googleId = props.googleId;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'isBlocked' | 'isProfileCompleted'>): Omit<UserProps, 'id'> {
    return {
      ...props,
      isBlocked: false,
      isProfileCompleted: false,
      createdAt: new Date(),
    };
  }

  hasAuthProvider(provider: AuthProvider): boolean {
    return this.authProviders.includes(provider);
  }

  canLoginWithPassword(): boolean {
    return this.password !== null && this.hasAuthProvider('local');
  }

  // Domain methods - return new immutable instances
  block(): Partial<UserProps> {
    return { isBlocked: true };
  }

  unblock(): Partial<UserProps> {
    return { isBlocked: false };
  }

  withPassword(hashedPassword: string): Partial<UserProps> {
    return { password: hashedPassword };
  }

  withGoogleLink(googleId: string): Partial<UserProps> {
    return {
      googleId,
      authProviders: [...this.authProviders.filter(p => p !== 'google'), 'google']
    };
  }

  withAuthProvider(provider: AuthProvider): Partial<UserProps> {
    if (this.authProviders.includes(provider)) return {};
    return { authProviders: [...this.authProviders, provider] };
  }

  withProfileCompleted(status: boolean): Partial<UserProps> {
    return { isProfileCompleted: status };
  }
}
