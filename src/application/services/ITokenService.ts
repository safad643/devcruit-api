export interface TokenPayload {
  userId: string;
  role: string;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): { token: string; tokenId: string };
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload & { tokenId: string };
}
