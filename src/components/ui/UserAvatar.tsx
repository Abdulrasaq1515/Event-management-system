import React from 'react';
import type { UserAvatarProps } from '@/types/profile.types';

export const UserAvatar: React.FC<UserAvatarProps> = ({ 
  user, 
  size = 'md', 
  showStatus = false,
  className = '' 
}) => {
  const getInitials = (displayName: string): string => {
    return displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const generateAvatarColor = (id?: string): string => {
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#06b6d4', // cyan
    ];
    
    if (!id) return colors[0];
    
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg',
  };

  const initials = getInitials(user.displayName);
  const avatarColor = generateAvatarColor(user.id);

  return (
    <div className={`relative inline-block ${className}`}>
      {user.profilePicture ? (
        <img
          src={user.profilePicture}
          alt={user.displayName}
          className={`${sizeClasses[size]} rounded-full object-cover border-2 border-slate-700`}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
      ) : null}
      
      <div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold border-2 border-slate-700 ${user.profilePicture ? 'hidden' : 'flex'}`}
        style={{ backgroundColor: avatarColor }}
      >
        {initials}
      </div>

      {showStatus && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
      )}
    </div>
  );
};

export default UserAvatar;
