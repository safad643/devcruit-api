import { IUserRepository, IOTPRepository, IRefreshTokenRepository } from '../../../domain/repositories';
import { IHashService } from '../../services';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../di/types';
import { ResetPasswordInput, ResetPasswordOutput } from '../../dtos/auth.dto';
import { UnauthorizedError, NotFoundError } from '../../../domain/errors';
import { PasswordValidator } from '../../validators/PasswordValidator';
import { IResetPasswordUseCase } from './interfaces';

@injectable()
export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    @inject(TYPES.UserRepository) private _userRepository: IUserRepository,
    @inject(TYPES.OTPRepository) private _otpRepository: IOTPRepository,
    @inject(TYPES.RefreshTokenRepository) private _refreshTokenRepository: IRefreshTokenRepository,
    @inject(TYPES.HashService) private _hashService: IHashService
  ) { }

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    // 1. Find user by email
    const user = await this._userRepository.findByEmail(input.email);
    if (!user) {
      throw new NotFoundError('Account not found with this email.');
    }

    // 2. Verify OTP
    const storedOtp = await this._otpRepository.find(input.email, 'reset');
    if (!storedOtp) {
      throw new UnauthorizedError('Password reset code expired.');
    }

    if (storedOtp !== input.otpCode) {
      throw new UnauthorizedError('Invalid password reset code.');
    }

    // 3. Validate new password
    PasswordValidator.validate(input.newPassword);

    // 4. Hash new password
    const hashedPassword = await this._hashService.hash(input.newPassword);

    // 5. Update password in database
    await this._userRepository.update(user.id, user.withPassword(hashedPassword));

    // 6. Invalidate all refresh tokens (logout from all devices)
    await this._refreshTokenRepository.deleteAllForUser(user.id);

    // 7. Delete OTP from Redis
    await this._otpRepository.delete(input.email, 'reset');

    // 8. Return success response
    return {
      message: 'Password reset successful. Please login with your new password.',
    };
  }
}
