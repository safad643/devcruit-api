export interface GoogleUserInfo {
    sub: string;
    email: string;
    email_verified: boolean;
    name?: string;
    picture?: string;
  }
  
  export interface IGoogleAuthService {
    exchangeCodeForTokens(code: string): Promise<string>;
    getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
  }
  