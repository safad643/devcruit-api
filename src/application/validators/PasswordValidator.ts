import { ValidationError } from '../../domain/errors';

export class PasswordValidator {
  static validate(password: string): void {
    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters', {
        password: 'Minimum 6 characters required',
      });
    }
    
    if (!/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter', {
        password: 'Uppercase letter required',
      });
    }
    
    if (!/[0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one number', {
        password: 'Number required',
      });
    }
    
    if (!/[^A-Za-z0-9]/.test(password)) {
      throw new ValidationError('Password must contain at least one special character', {
        password: 'Special character required',
      });
    }
  }
}
