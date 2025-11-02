export const TYPES = {
    // Infrastructure
    UserRepository: Symbol.for('UserRepository'),
    AdminRepository: Symbol.for('AdminRepository'),
    DeveloperProfileRepository: Symbol.for('DeveloperProfileRepository'),
    CompanyProfileRepository: Symbol.for('CompanyProfileRepository'),
    PendingUserRepository: Symbol.for('PendingUserRepository'),
    OTPRepository: Symbol.for('OTPRepository'),
    RefreshTokenRepository: Symbol.for('RefreshTokenRepository'),
    HashService: Symbol.for('HashService'),
    TokenService: Symbol.for('TokenService'),
    GoogleAuthService: Symbol.for('GoogleAuthService'),
    EmailService: Symbol.for('EmailService'),
    FileService: Symbol.for('FileService'),
  
    // Auth module
    RegisterUserUseCase: Symbol.for('RegisterUserUseCase'),
    VerifyEmailUseCase: Symbol.for('VerifyEmailUseCase'),
    LoginUseCase: Symbol.for('LoginUseCase'),
    AdminLoginUseCase: Symbol.for('AdminLoginUseCase'),
    ResendOTPUseCase: Symbol.for('ResendOTPUseCase'),
    ForgotPasswordUseCase: Symbol.for('ForgotPasswordUseCase'),
    ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),
    RefreshTokenUseCase: Symbol.for('RefreshTokenUseCase'),
    LogoutUseCase: Symbol.for('LogoutUseCase'),
    AuthController: Symbol.for('AuthController'),
    GoogleLoginUseCase: Symbol.for('GoogleLoginUseCase'),
    GoogleRegisterUseCase: Symbol.for('GoogleRegisterUseCase'),
    
    // Profile module
    CreateDeveloperProfileUseCase: Symbol.for('CreateDeveloperProfileUseCase'),
    GetDeveloperProfileUseCase: Symbol.for('GetDeveloperProfileUseCase'),
    CreateCompanyProfileUseCase: Symbol.for('CreateCompanyProfileUseCase'),
    GetCompanyProfileUseCase: Symbol.for('GetCompanyProfileUseCase'),
    ResubmitDocumentsUseCase: Symbol.for('ResubmitDocumentsUseCase'),
    ProfileController: Symbol.for('ProfileController'),
    
    // File module
    GenerateSignatureUseCase: Symbol.for('GenerateSignatureUseCase'),
    DeleteFileUseCase: Symbol.for('DeleteFileUseCase'),
    FileController: Symbol.for('FileController'),
    
    // Admin module
    BlockUserUseCase: Symbol.for('BlockUserUseCase'),
    UnblockUserUseCase: Symbol.for('UnblockUserUseCase'),
    ApproveCompanyUseCase: Symbol.for('ApproveCompanyUseCase'),
    RejectCompanyUseCase: Symbol.for('RejectCompanyUseCase'),
    ListCompaniesUseCase: Symbol.for('ListCompaniesUseCase'),
    ListDevelopersUseCase: Symbol.for('ListDevelopersUseCase'),
    AdminController: Symbol.for('AdminController'),
  };
  