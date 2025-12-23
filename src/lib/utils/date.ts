/**
 * Date formatting utilities for the events system
 */

/**
 * Format a date to a readable string
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Format a time to a readable string
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format a date and time to a readable string
 */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} at ${formatTime(date)}`;
}

/**
 * Get relative time string (e.g., "2 hours ago", "in 3 days")
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((date.getTime() - now.getTime()) / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (Math.abs(diffInDays) >= 1) {
    return diffInDays > 0 ? `in ${diffInDays} day${diffInDays > 1 ? 's' : ''}` : `${Math.abs(diffInDays)} day${Math.abs(diffInDays) > 1 ? 's' : ''} ago`;
  }
  
  if (Math.abs(diffInHours) >= 1) {
    return diffInHours > 0 ? `in ${diffInHours} hour${diffInHours > 1 ? 's' : ''}` : `${Math.abs(diffInHours)} hour${Math.abs(diffInHours) > 1 ? 's' : ''} ago`;
  }
  
  if (Math.abs(diffInMinutes) >= 1) {
    return diffInMinutes > 0 ? `in ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}` : `${Math.abs(diffInMinutes)} minute${Math.abs(diffInMinutes) > 1 ? 's' : ''} ago`;
  }
  
  return 'just now';
}

/**
 * Check if an event is happening now
 */
export function isEventLive(startDate: Date, endDate: Date): boolean {
  const now = new Date();
  return now >= startDate && now <= endDate;
}

/**
 * Check if an event is upcoming
 */
export function isEventUpcoming(startDate: Date): boolean {
  const now = new Date();
  return startDate > now;
}

/**
 * Check if an event has ended
 */
export function isEventEnded(endDate: Date): boolean {
  const now = new Date();
  return endDate < now;
}

/**
 * Get event status based on dates
 */
export function getEventStatus(startDate: Date, endDate: Date): 'upcoming' | 'live' | 'ended' {
  if (isEventLive(startDate, endDate)) return 'live';
  if (isEventUpcoming(startDate)) return 'upcoming';
  return 'ended';
}