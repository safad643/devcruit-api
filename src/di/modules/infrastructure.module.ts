import { ContainerModule } from 'inversify';
import { TYPES } from '../types';

import { 
  IUserRepository,
  IDeveloperProfileRepository, 
  ICompanyProfileRepository,
  IPendingUserRepository, 
  IOTPRepository, 
  IRefreshTokenRepository 
} from '../../domain/repositories';

import { IHashService, ITokenService, IEmailService, IGoogleAuthService, IFileService } from '../../application/services';

import { UserRepository } from '../../infrastructure/database/mongodb/UserRepository';
import { DeveloperProfileRepository } from '../../infrastructure/database/mongodb/DeveloperProfileRepository';
import { CompanyProfileRepository } from '../../infrastructure/database/mongodb/CompanyProfileRepository';
import { PendingUserRepository } from '../../infrastructure/database/redis/PendingUserRepository';
import { OTPRepository } from '../../infrastructure/database/redis/OTPRepository';
import { RefreshTokenRepository } from '../../infrastructure/database/redis/RefreshTokenRepository';
import { HashService } from '../../infrastructure/security/HashService';
import { TokenService } from '../../infrastructure/security/TokenService';
import { EmailService } from '../../infrastructure/email/EmailService';
import { GoogleAuthService } from '../../infrastructure/security/GoogleAuthService';
import { CloudinaryService } from '../../infrastructure/storage/CloudinaryService';


export const infrastructureModule = new ContainerModule((bind) => {
  // Repositories
  bind<IUserRepository>(TYPES.UserRepository).to(UserRepository).inSingletonScope();
  bind<IDeveloperProfileRepository>(TYPES.DeveloperProfileRepository).to(DeveloperProfileRepository).inSingletonScope();
  bind<ICompanyProfileRepository>(TYPES.CompanyProfileRepository).to(CompanyProfileRepository).inSingletonScope();
  bind<IPendingUserRepository>(TYPES.PendingUserRepository).to(PendingUserRepository).inSingletonScope();
  bind<IOTPRepository>(TYPES.OTPRepository).to(OTPRepository).inSingletonScope();
  bind<IRefreshTokenRepository>(TYPES.RefreshTokenRepository).to(RefreshTokenRepository).inSingletonScope();

  // Services
  bind<IGoogleAuthService>(TYPES.GoogleAuthService).to(GoogleAuthService).inSingletonScope();
  bind<IHashService>(TYPES.HashService).to(HashService).inSingletonScope();
  bind<ITokenService>(TYPES.TokenService).to(TokenService).inSingletonScope();
  bind<IEmailService>(TYPES.EmailService).to(EmailService).inSingletonScope();
  bind<IFileService>(TYPES.FileService).to(CloudinaryService).inSingletonScope();
});
