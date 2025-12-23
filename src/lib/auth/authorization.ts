/**
 * Authorization utilities for event operations
 */

import { JWTPayload, UserRole } from './types';
import { AppError, ErrorCode } from '../utils/error-handler';
import { eventService } from '../services/event.service';
import type { Event } from '../db/schema';

/**
 * Permission types for different operations
 */
export type Permission = 
  | 'event:create'
  | 'event:read'
  | 'event:update'
  | 'event:delete'
  | 'event:publish'
  | 'event:moderate'
  | 'admin:all';

/**
 * Role-based permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  user: [
    'event:read',
  ],
  organizer: [
    'event:create',
    'event:read',
    'event:update',
    'event:delete',
    'event:publish',
  ],
  admin: [
    'event:create',
    'event:read',
    'event:update',
    'event:delete',
    'event:publish',
    'event:moderate',
    'admin:all',
  ],
};

/**
 * Check if user has specific permission
 */
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(permission) || rolePermissions.includes('admin:all');
}

/**
 * Require specific permission or throw error
 */
export function requirePermission(userRole: UserRole, permission: Permission): void {
  if (!hasPermission(userRole, permission)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      `Access denied. Required permission: ${permission}`,
      403
    );
  }
}

/**
 * Check if user can perform operation on specific event
 */
export async function canAccessEvent(
  user: JWTPayload,
  eventId: string,
  operation: 'read' | 'update' | 'delete' | 'publish'
): Promise<boolean> {
  try {
    // Get the event to check ownership
    const event = await eventService.findById(eventId);
    if (!event) {
      return false;
    }

    // Admin can access all events (but only if the event exists)
    if (user.role === 'admin') {
      return true;
    }

    // Check operation-specific permissions
    switch (operation) {
      case 'read':
        // Anyone can read public events, organizers can read their own events
        if (event.visibility === 'public' && event.status === 'published') {
          return true;
        }
        return event.organizerId === user.userId && hasPermission(user.role, 'event:read');

      case 'update':
      case 'delete':
      case 'publish':
        // Only event owner or admin can modify events
        const permissionMap = {
          update: 'event:update' as Permission,
          delete: 'event:delete' as Permission,
          publish: 'event:publish' as Permission,
        };
        
        return event.organizerId === user.userId && 
               hasPermission(user.role, permissionMap[operation]);

      default:
        return false;
    }
  } catch (error) {
    console.error('Error checking event access:', error);
    return false;
  }
}

/**
 * Require event access or throw error
 */
export async function requireEventAccess(
  user: JWTPayload,
  eventId: string,
  operation: 'read' | 'update' | 'delete' | 'publish'
): Promise<Event> {
  const event = await eventService.findById(eventId);
  
  if (!event) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      'Event not found',
      404
    );
  }

  const hasAccess = await canAccessEvent(user, eventId, operation);
  
  if (!hasAccess) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      `You do not have permission to ${operation} this event`,
      403
    );
  }

  return event;
}

/**
 * Check if user owns the event
 */
export async function verifyEventOwnership(
  user: JWTPayload,
  eventId: string
): Promise<Event> {
  const event = await eventService.findById(eventId);
  
  if (!event) {
    throw new AppError(
      ErrorCode.NOT_FOUND,
      'Event not found',
      404
    );
  }

  // Admin can access any event
  if (user.role === 'admin') {
    return event;
  }

  // Check ownership
  if (event.organizerId !== user.userId) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      'You do not have permission to access this event',
      403
    );
  }

  return event;
}

/**
 * Filter events based on user permissions
 */
export function filterEventsByPermission(
  events: Event[],
  user: JWTPayload | null
): Event[] {
  return events.filter(event => {
    // Public published events are visible to everyone
    if (event.visibility === 'public' && event.status === 'published') {
      return true;
    }

    // No user context - only show public events
    if (!user) {
      return false;
    }

    // Admin can see all events
    if (user.role === 'admin') {
      return true;
    }

    // Organizers can see their own events
    if (event.organizerId === user.userId) {
      return true;
    }

    return false;
  });
}

/**
 * Get user's accessible event statuses
 */
export function getAccessibleEventStatuses(user: JWTPayload | null): string[] {
  if (!user) {
    return ['published']; // Public users can only see published events
  }

  if (user.role === 'admin') {
    return ['draft', 'published', 'cancelled', 'completed', 'archived'];
  }

  if (user.role === 'organizer') {
    return ['draft', 'published', 'cancelled', 'completed']; // Organizers can't see archived unless it's their own
  }

  return ['published']; // Regular users can only see published events
}

/**
 * Authorization middleware for API routes
 */
export function withEventAuthorization(
  operation: 'read' | 'update' | 'delete' | 'publish'
) {
  return async (user: JWTPayload, eventId: string): Promise<Event> => {
    return await requireEventAccess(user, eventId, operation);
  };
}

/**
 * Check if user can create events
 */
export function canCreateEvent(user: JWTPayload): boolean {
  return hasPermission(user.role, 'event:create');
}

/**
 * Require event creation permission
 */
export function requireEventCreation(user: JWTPayload): void {
  if (!canCreateEvent(user)) {
    throw new AppError(
      ErrorCode.FORBIDDEN,
      'You do not have permission to create events',
      403
    );
  }
}

/**
 * Get user's event query constraints
 */
export function getUserEventConstraints(user: JWTPayload | null): {
  organizerId?: string;
  visibility?: string[];
  status?: string[];
} {
  if (!user) {
    return {
      visibility: ['public'],
      status: ['published'],
    };
  }

  if (user.role === 'admin') {
    return {}; // No constraints for admin
  }

  if (user.role === 'organizer') {
    return {
      organizerId: user.userId, // Can only see their own events when filtering by organizer
    };
  }

  return {
    visibility: ['public'],
    status: ['published'],
  };
}