/**
 * Authentication and authorization types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'organizer' | 'admin' | 'user';

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthContext {
  user: User;
  token: string;
}

export interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

export interface SessionData {
  userId: string;
  email: string;
  role: UserRole;
  expiresAt: Date;
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  refreshTokenExpiresIn: string;
}