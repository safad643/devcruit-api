import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import { 
  IUserRepository, 
  IPendingUserRepository, 
  IOTPRepository, 
  IRefreshTokenRepository 
} from '../../domain/repositories';

import { IHashService, ITokenService, IEmailService } from '../../application/services';

import { UserRepository } from '../../infrastructure/database/mongodb/UserRepository';
import { PendingUserRepository } from '../../infrastructure/database/redis/PendingUserRepository';
import { OTPRepository } from '../../infrastructure/database/redis/OTPRepository';
import { RefreshTokenRepository } from '../../infrastructure/database/redis/RefreshTokenRepository';
import { HashService } from '../../infrastructure/security/HashService';
import { TokenService } from '../../infrastructure/security/TokenService';
import { EmailService } from '../../infrastructure/email/EmailService';

export const infrastructureModule = new ContainerModule((bind) => {
  // Repositories
  bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
  bind<IPendingUserRepository>(TYPES.PendingUserRepository).to(PendingUserRepository).inSingletonScope();
  bind<IOTPRepository>(TYPES.OTPRepository).to(OTPRepository).inSingletonScope();
  bind<IRefreshTokenRepository>(TYPES.RefreshTokenRepository).to(RefreshTokenRepository).inSingletonScope();

  // Services
  bind<IHashService>(TYPES.HashService).to(HashService).inSingletonScope();
  bind<ITokenService>(TYPES.TokenService).to(TokenService).inSingletonScope();
  bind<IEmailService>(TYPES.EmailService).to(EmailService).inSingletonScope();
});
