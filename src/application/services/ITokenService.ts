import { UserRole } from "../../domain/types";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export interface ITokenService {
  generateAccessToken(payload: TokenPayload): string;
  generateRefreshToken(payload: TokenPayload): { token: string; tokenId: string };
  verifyAccessToken(token: string): TokenPayload;
  verifyRefreshToken(token: string): TokenPayload & { tokenId: string };
}
