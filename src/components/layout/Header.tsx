'use client';
import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { ProfileDropdown } from '@/components/profile/ProfileDropdown'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useProfile } from '@/lib/hooks/useProfile'
import type { UserProfile } from '@/types/profile.types'

type BreadcrumbItem = {
  label: string
  href?: string
}

type Props = {
  breadcrumbs?: BreadcrumbItem[]
}

export const Header: React.FC<Props> = ({ breadcrumbs = [] }) => {
  const router = useRouter();
  const { data: profile, isLoading } = useProfile();
  
  // Fallback mock user data for when profile is loading or not available
  const mockUser: UserProfile = {
    id: 'dev-user-123',
    email: 'haley.carter@example.com',
    firstName: 'Haley',
    lastName: 'Carter',
    displayName: 'Haley Carter',
    profilePicture: undefined,
    role: 'organizer',
    bio: null,
    organization: null,
    website: null,
    socialLinks: null,
    preferences: {
      emailNotifications: true,
      theme: 'system',
      timezone: 'UTC',
      language: 'en'
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  };

  const user = profile || mockUser;

  const handleLogout = () => {
    console.log('Logout clicked');
    router.push('/');
  };

  const handleProfileClick = () => {
    router.push('/profile');
  };

  const handleSettingsClick = () => {
    router.push('/profile/edit');
  };

  return (
    <header className="w-full bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold text-slate-100 hover:text-blue-400 transition-colors">
              EventHub
            </Link>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link 
                href="/events" 
                className="text-slate-300 hover:text-slate-100 font-medium transition-colors"
              >
                Events
              </Link>
              <Link 
                href="/analytics" 
                className="text-slate-300 hover:text-slate-100 font-medium transition-colors"
              >
                Analytics
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <input
                placeholder="Search events, attendees..."
                className="px-4 py-2 rounded-lg bg-slate-800/50 text-slate-200 placeholder-slate-500 border border-slate-700/50 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all w-64"
              />
            </div>
            
            <Link href="/events/new">
              <Button variant="primary" className="font-medium">
                + Create Event
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg bg-slate-800/50 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors relative">
                🔔
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
              </button>
              
              {isLoading ? (
                <div className="w-10 h-10 rounded-full bg-slate-800 animate-pulse"></div>
              ) : (
                <ProfileDropdown
                  user={user}
                  onLogout={handleLogout}
                  onProfileClick={handleProfileClick}
                  onSettingsClick={handleSettingsClick}
                />
              )}
            </div>
          </div>
        </div>

        {/* Breadcrumbs */}
        {breadcrumbs.length > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/50">
            <Link href="/" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
              Home
            </Link>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <span className="text-slate-600">/</span>
                {item.href ? (
                  <Link 
                    href={item.href} 
                    className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="text-slate-200 text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
