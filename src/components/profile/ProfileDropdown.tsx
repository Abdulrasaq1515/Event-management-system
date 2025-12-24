'use client';
import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import type { ProfileDropdownProps } from '@/types/profile.types';
import { UserAvatar } from '@/components/ui/UserAvatar';

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  user,
  onLogout,
  onProfileClick,
  onSettingsClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <UserAvatar user={user} size="md" showStatus />
        <span className="hidden md:block text-slate-200 font-medium">
          {user.displayName}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* User Info Header */}
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <UserAvatar user={user} size="md" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-100 truncate">
                  {user.displayName}
                </div>
                <div className="text-sm text-slate-400 truncate">
                  {user.email}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => {
                onProfileClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>👤</span>
              <span>View Profile</span>
            </button>

            <button
              onClick={() => {
                onSettingsClick();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>⚙️</span>
              <span>Settings</span>
            </button>

            <Link
              href="/events"
              className="block w-full px-4 py-2 text-left text-slate-200 hover:bg-slate-800 transition-colors flex items-center gap-2"
              onClick={() => setIsOpen(false)}
            >
              <span>📅</span>
              <span>My Events</span>
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-slate-700 py-2">
            <button
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
