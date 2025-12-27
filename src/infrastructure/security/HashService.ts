import bcrypt from 'bcrypt';
import { IHashService } from '../../application/services';
import { InternalError } from '../../domain/errors';
import { injectable } from 'inversify';

@injectable()
export class HashService implements IHashService {
  private readonly _saltRounds = 10;

  async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this._saltRounds);
    } catch (error) {
      throw new InternalError('Failed to hash password', error as Error);
    }
  }

  async compare(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new InternalError('Failed to compare password', error as Error);
    }
  }
}
