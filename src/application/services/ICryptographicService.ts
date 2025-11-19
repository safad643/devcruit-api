/**
 * Service interface for cryptographic operations
 */
export interface ICryptographicService {
  /**
   * Generates a cryptographically secure random OTP code with the configured length
   * @returns A string containing the OTP code with exactly the configured number of digits
   */
  generateOTP(): string;

  /**
   * Generates a cryptographically secure random temporary password
   * @param length Optional password length (defaults to 12)
   * @returns A string containing a secure temporary password
   */
  generateTemporaryPassword(length?: number): string;
}

