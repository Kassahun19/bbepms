// =============================================================================
// Bunna Bank S.C. EPMS - JWT Utility
// =============================================================================
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  branchId?: string;
  districtId?: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (config.jwt.expiresIn as any) || '24h',
  };
  return jwt.sign(payload, config.jwt.secret, options);
}

export function generateRefreshToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: (config.jwt.refreshExpiresIn as any) || '7d',
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwt.secret) as TokenPayload;
  } catch (err) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwt.refreshSecret) as TokenPayload;
  } catch (err) {
    return null;
  }
}
