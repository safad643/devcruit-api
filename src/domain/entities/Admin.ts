export interface AdminProps {
  id: string;
  email: string;
  password: string;
  role: 'admin';
  createdAt: Date;
}

export class Admin {
  public readonly id: string;
  public readonly email: string;
  public readonly password: string;
  public readonly role: 'admin';
  public readonly createdAt: Date;

  constructor(props: AdminProps) {
    this.id = props.id;
    this.email = props.email;
    this.password = props.password;
    this.role = props.role;
    this.createdAt = props.createdAt;
  }

  static create(props: Omit<AdminProps, 'id' | 'createdAt'>): Omit<AdminProps, 'id'> {
    return {
      ...props,
      createdAt: new Date(),
    };
  }
}

