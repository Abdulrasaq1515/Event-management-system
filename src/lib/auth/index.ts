/**
 * Authentication module exports
 */

// Types
export type { 
  User, 
  UserRole, 
  JWTPayload, 
  AuthContext, 
  AuthRequest, 
  SessionData, 
  AuthConfig 
} from './types';

// Configuration
export { 
  authConfig, 
  validateJWTSecret,
  AUTH_COOKIE_NAME, 
  REFRESH_COOKIE_NAME, 
  TOKEN_HEADER_NAME, 
  TOKEN_PREFIX, 
  ORGANIZER_ID_HEADER 
} from './config';

// JWT utilities
export {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
  extractTokenFromHeader,
  isTokenExpired,
  getTokenExpiration,
  refreshAccessToken,
} from './jwt';

// Middleware
export {
  extractAuthToken,
  authenticateRequest,
  requireRole,
  requireOrganizer,
  requireAdmin,
  extractOrganizerId,
  withAuth,
  optionalAuth,
  SessionManager,
} from './middleware';

// Authorization
export type { Permission } from './authorization';
export {
  hasPermission,
  requirePermission,
  canAccessEvent,
  requireEventAccess,
  verifyEventOwnership,
  filterEventsByPermission,
  getAccessibleEventStatuses,
  withEventAuthorization,
  canCreateEvent,
  requireEventCreation,
  getUserEventConstraints,
} from './authorization';