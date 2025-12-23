/**
 * Authentication configuration
 */

import { AuthConfig } from './types';

export const authConfig: AuthConfig = {
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
};

// Function to validate JWT secret when needed
export function validateJWTSecret(): string {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  return authConfig.jwtSecret;
}

export const AUTH_COOKIE_NAME = 'auth-token';
export const REFRESH_COOKIE_NAME = 'refresh-token';

// Token validation constants
export const TOKEN_HEADER_NAME = 'authorization';
export const TOKEN_PREFIX = 'Bearer ';
export const ORGANIZER_ID_HEADER = 'x-organizer-id';