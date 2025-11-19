import { injectable } from 'inversify';
import { ICryptographicService } from '../../application/services/ICryptographicService';
import { config } from '../../config';
import { randomInt } from 'crypto';

/**
 * Service for cryptographic operations
 * Uses crypto.randomInt for cryptographically secure random number generation
 */
@injectable()
export class CryptographicService implements ICryptographicService {
  /**
   * Generates a cryptographically secure random OTP code with the configured length
   * Uses crypto.randomInt for secure random number generation
   * @returns A string containing the OTP code with exactly the configured number of digits
   */
  generateOTP(): string {
    const length = config.otp.length;
    if (length <= 0) {
      throw new Error('OTP length must be greater than 0');
    }
    
    // Generate a cryptographically secure random number
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
    const otp = randomInt(min, max + 1);
    
    // Pad with leading zeros if necessary (ensures exact length)
    return otp.toString().padStart(length, '0');
  }

  /**
   * Generates a cryptographically secure random temporary password
   * Uses crypto.randomInt for secure random character selection
   * @param length Optional password length (defaults to 12)
   * @returns A string containing a secure temporary password
   */
  generateTemporaryPassword(length: number = 12): string {
    if (length <= 0) {
      throw new Error('Password length must be greater than 0');
    }

    // Character set excluding ambiguous characters (0, O, I, l, 1)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let password = '';

    for (let i = 0; i < length; i += 1) {
      // Use crypto.randomInt for cryptographically secure random index
      const index = randomInt(0, chars.length);
      password += chars[index];
    }

    return password;
  }
}

