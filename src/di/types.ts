export const TYPES = {
    // Infrastructure
    UserRepository: Symbol.for('UserRepository'),
    PendingUserRepository: Symbol.for('PendingUserRepository'),
    OTPRepository: Symbol.for('OTPRepository'),
    RefreshTokenRepository: Symbol.for('RefreshTokenRepository'),
    HashService: Symbol.for('HashService'),
    TokenService: Symbol.for('TokenService'),
    EmailService: Symbol.for('EmailService'),
  
    // Auth module
    RegisterUserUseCase: Symbol.for('RegisterUserUseCase'),
    VerifyEmailUseCase: Symbol.for('VerifyEmailUseCase'),
    LoginUseCase: Symbol.for('LoginUseCase'),
    ResendOTPUseCase: Symbol.for('ResendOTPUseCase'),
    ForgotPasswordUseCase: Symbol.for('ForgotPasswordUseCase'),
    ResetPasswordUseCase: Symbol.for('ResetPasswordUseCase'),
    RefreshTokenUseCase: Symbol.for('RefreshTokenUseCase'),
    LogoutUseCase: Symbol.for('LogoutUseCase'),
    AuthController: Symbol.for('AuthController'),
  };
  