import {
    LoginInput,
    AdminAuthTokensOutput,
    ForgotPasswordInput,
    ForgotPasswordOutput,
    GoogleLoginInput,
    GoogleLoginOutput,
    GoogleRegisterInput,
    GoogleRegisterOutput,
    AuthTokensOutput,
    LogoutInput,
    LogoutOutput,
    RefreshTokenInput,
    RefreshTokenOutput,
    RegisterUserInput,
    RegisterUserOutput,
    ResendOTPInput,
    ResendOTPOutput,
    ResetPasswordInput,
    ResetPasswordOutput,
    VerifyEmailInput,
} from '../../dtos/auth.dto';

export interface IRegisterUserUseCase {
    execute(input: RegisterUserInput): Promise<RegisterUserOutput>;
}

export interface IVerifyEmailUseCase {
    execute(input: VerifyEmailInput): Promise<AuthTokensOutput>;
}

export interface ILoginUseCase {
    execute(input: LoginInput): Promise<AuthTokensOutput>;
}

export interface IAdminLoginUseCase {
    execute(input: LoginInput): Promise<AdminAuthTokensOutput>;
}

export interface IResendOTPUseCase {
    execute(input: ResendOTPInput): Promise<ResendOTPOutput>;
}

export interface IForgotPasswordUseCase {
    execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput>;
}

export interface IResetPasswordUseCase {
    execute(input: ResetPasswordInput): Promise<ResetPasswordOutput>;
}

export interface IRefreshTokenUseCase {
    execute(input: RefreshTokenInput): Promise<RefreshTokenOutput>;
}

export interface ILogoutUseCase {
    execute(input: LogoutInput): Promise<LogoutOutput>;
}

export interface IGoogleLoginUseCase {
    execute(input: GoogleLoginInput): Promise<GoogleLoginOutput>;
}

export interface IGoogleRegisterUseCase {
    execute(input: GoogleRegisterInput): Promise<GoogleRegisterOutput>;
}
