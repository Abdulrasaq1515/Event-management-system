/**
 * Authentication middleware for API routes
 */

import { NextRequest } from 'next/server';
import { verifyToken, extractTokenFromHeader } from './jwt';
import { JWTPayload, User, UserRole } from './types';
import { TOKEN_HEADER_NAME, ORGANIZER_ID_HEADER } from './config';
import { AppError, ErrorCode } from '../utils/error-handler';

/**
 * Extract and validate JWT token from request
 */
export function extractAuthToken(request: NextRequest): string {
  // Try Authorization header first
  const authHeader = request.headers.get(TOKEN_HEADER_NAME);
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'Authentication token required',
      401
    );
  }

  return token;
}

/**
 * Authenticate request and extract user information
 */
export function authenticateRequest(request: NextRequest): JWTPayload {
  try {
    const token = extractAuthToken(request);
    const payload = verifyToken(token);
    
    console.log(`🔐 Authenticated user: ${payload.email} (${payload.role})`);
    return payload;
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    
    throw new AppError(
      ErrorCode.UNAUTHORIZED,
      'Authentication failed',
      401
    );
  }
}

/**
 * Check if user has required role
 */
export function requireRole(userRole: UserRole, requiredRoles: UserRole[]): void {
  if (!requiredRoles.includes(userRole)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      `Access denied. Required roles: ${requiredRoles.join(', ')}`,
      403
    );
  }
}

/**
 * Check if user is an organizer (can create/manage events)
 */
export function requireOrganizer(userRole: UserRole): void {
  requireRole(userRole, ['organizer', 'admin']);
}

/**
 * Check if user is an admin
 */
export function requireAdmin(userRole: UserRole): void {
  requireRole(userRole, ['admin']);
}

/**
 * Extract organizer ID from authenticated request
 * This replaces the temporary x-organizer-id header approach
 */
export function extractOrganizerId(request: NextRequest): string {
  try {
    const payload = authenticateRequest(request);
    
    // Ensure user has organizer permissions
    requireOrganizer(payload.role);
    
    return payload.userId;
  } catch (error) {
    // Fallback to legacy header for backward compatibility during transition
    const legacyOrganizerId = request.headers.get(ORGANIZER_ID_HEADER);
    if (legacyOrganizerId) {
      console.warn('⚠️  Using legacy x-organizer-id header. Please migrate to JWT authentication.');
      return legacyOrganizerId;
    }
    
    throw error;
  }
}

/**
 * Middleware wrapper for protected routes
 */
export function withAuth<T extends unknown[]>(
  handler: (request: NextRequest, user: JWTPayload, ...args: T) => Promise<Response>,
  options: {
    requiredRoles?: UserRole[];
    requireOrganizer?: boolean;
    requireAdmin?: boolean;
  } = {}
) {
  return async (request: NextRequest, ...args: T): Promise<Response> => {
    try {
      const user = authenticateRequest(request);
      
      // Check role requirements
      if (options.requiredRoles) {
        requireRole(user.role, options.requiredRoles);
      }
      
      if (options.requireOrganizer) {
        requireOrganizer(user.role);
      }
      
      if (options.requireAdmin) {
        requireAdmin(user.role);
      }
      
      return await handler(request, user, ...args);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      throw new AppError(
        ErrorCode.UNAUTHORIZED,
        'Authentication failed',
        401
      );
    }
  };
}

/**
 * Optional authentication - doesn't throw if no token provided
 * Also supports legacy x-organizer-id header for development
 */
export function optionalAuth(request: NextRequest): JWTPayload | null {
  try {
    return authenticateRequest(request);
  } catch {
    // Fallback to legacy header for backward compatibility
    const legacyOrganizerId = request.headers.get(ORGANIZER_ID_HEADER);
    if (legacyOrganizerId) {
      console.warn('⚠️  Using legacy x-organizer-id header in optionalAuth. Please migrate to JWT authentication.');
      // Return a mock JWT payload for the legacy organizer ID
      return {
        userId: legacyOrganizerId,
        email: `${legacyOrganizerId}@legacy.local`,
        role: 'organizer',
        iat: Date.now(),
        exp: Date.now() + 86400000, // 24 hours
      };
    }
    return null;
  }
}

/**
 * Session management utilities
 */
export class SessionManager {
  private static sessions = new Map<string, { payload: JWTPayload; expiresAt: Date }>();

  /**
   * Store session data (in-memory for now, should use Redis in production)
   */
  static storeSession(token: string, payload: JWTPayload, expiresAt: Date): void {
    this.sessions.set(token, { payload, expiresAt });
    
    // Clean up expired sessions periodically
    this.cleanupExpiredSessions();
  }

  /**
   * Get session data
   */
  static getSession(token: string): JWTPayload | null {
    const session = this.sessions.get(token);
    
    if (!session) {
      return null;
    }
    
    if (session.expiresAt < new Date()) {
      this.sessions.delete(token);
      return null;
    }
    
    return session.payload;
  }

  /**
   * Remove session
   */
  static removeSession(token: string): void {
    this.sessions.delete(token);
  }

  /**
   * Clean up expired sessions
   */
  private static cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [token, session] of this.sessions.entries()) {
      if (session.expiresAt < now) {
        this.sessions.delete(token);
      }
    }
  }

  /**
   * Get active session count
   */
  static getActiveSessionCount(): number {
    this.cleanupExpiredSessions();
    return this.sessions.size;
  }
}