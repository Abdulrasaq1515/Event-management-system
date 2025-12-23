/**
 * JWT token utilities for authentication
 */

import jwt from 'jsonwebtoken';
import { authConfig, validateJWTSecret } from './config';
import { JWTPayload, User } from './types';
import { AppError, ErrorCode } from '../utils/error-handler';

/**
 * Generate JWT access token
 */
export function generateAccessToken(user: User): string {
  const jwtSecret = validateJWTSecret();
  
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: authConfig.jwtExpiresIn,
    issuer: 'events-management-system',
    audience: 'events-api',
  });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(user: User): string {
  const jwtSecret = validateJWTSecret();
  
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, jwtSecret, {
    expiresIn: authConfig.refreshTokenExpiresIn,
    issuer: 'events-management-system',
    audience: 'events-refresh',
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string, audience: 'events-api' | 'events-refresh' = 'events-api'): JWTPayload {
  const jwtSecret = validateJWTSecret();
  
  try {
    const decoded = jwt.verify(token, jwtSecret, {
      issuer: 'events-management-system',
      audience,
    }) as JWTPayload;

    // Validate required fields
    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Invalid token payload',
        401
      );
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Invalid token',
        401
      );
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Token expired',
        401
      );
    }
    
    if (error instanceof jwt.NotBeforeError) {
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Token not active',
        401
      );
    }

    // Re-throw AppError instances
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'Token verification failed',
      401
    );
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader) {
    return null;
  }

  // Check for Bearer token format
  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return token.trim() || null;
}

/**
 * Check if token is expired (without verifying signature)
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(token: string): Date | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    if (!decoded || !decoded.exp) {
      return null;
    }

    return new Date(decoded.exp * 1000);
  } catch {
    return null;
  }
}

/**
 * Refresh access token using refresh token
 */
export function refreshAccessToken(refreshToken: string): { accessToken: string; user: JWTPayload } {
  try {
    // Verify refresh token
    const payload = verifyToken(refreshToken, 'events-refresh');
    
    // Create new access token with same payload
    const user: User = {
      id: payload.userId,
      email: payload.email,
      name: '', // This would come from database in real implementation
      role: payload.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const accessToken = generateAccessToken(user);

    return {
      accessToken,
      user: payload,
    };
  } catch (error) {
    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'Invalid refresh token',
      401
    );
  }
}