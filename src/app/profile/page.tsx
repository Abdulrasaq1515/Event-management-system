'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { useProfile } from '@/lib/hooks/useProfile';

export default function ProfilePage() {
  const router = useRouter();
  const { data: profile, isLoading, error } = useProfile();

  const breadcrumbs = [
    { label: 'Profile' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header breadcrumbs={breadcrumbs} />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
              <span className="text-slate-200">Loading profile...</span>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-950">
        <Header breadcrumbs={breadcrumbs} />
        <main className="max-w-4xl mx-auto px-6 py-8">
          <Card className="p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-400 mb-2">Profile Not Found</h2>
              <p className="text-slate-400 mb-4">
                {error?.message || 'Unable to load your profile.'}
              </p>
              <Button variant="primary" onClick={() => router.push('/events')}>
                Back to Events
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header breadcrumbs={breadcrumbs} />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <UserAvatar user={profile} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-slate-100">{profile.displayName}</h1>
                <p className="text-slate-400">{profile.email}</p>
                <div className="mt-1">
                  <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-300">
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>
            <Button variant="primary" onClick={() => router.push('/profile/edit')}>
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Personal Information</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-500">First Name</div>
                <div className="text-slate-200">{profile.firstName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Last Name</div>
                <div className="text-slate-200">{profile.lastName}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Email</div>
                <div className="text-slate-200">{profile.email}</div>
              </div>
              {profile.bio && (
                <div>
                  <div className="text-sm text-slate-500">Bio</div>
                  <div className="text-slate-200">{profile.bio}</div>
                </div>
              )}
            </div>
          </Card>

          {/* Professional Information */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Professional Information</h2>
            <div className="space-y-3">
              {profile.organization ? (
                <div>
                  <div className="text-sm text-slate-500">Organization</div>
                  <div className="text-slate-200">{profile.organization}</div>
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No organization set</div>
              )}
              {profile.website && (
                <div>
                  <div className="text-sm text-slate-500">Website</div>
                  <a 
                    href={profile.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
            </div>
          </Card>

          {/* Account Activity */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Account Activity</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-500">Member Since</div>
                <div className="text-slate-200">
                  {new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              {profile.lastLoginAt && (
                <div>
                  <div className="text-sm text-slate-500">Last Login</div>
                  <div className="text-slate-200">
                    {new Date(profile.lastLoginAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Preferences */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Preferences</h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-slate-500">Theme</div>
                <div className="text-slate-200 capitalize">
                  {typeof profile.preferences === 'object' && profile.preferences !== null 
                    ? (profile.preferences as any).theme || 'System'
                    : 'System'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Timezone</div>
                <div className="text-slate-200">
                  {typeof profile.preferences === 'object' && profile.preferences !== null 
                    ? (profile.preferences as any).timezone || 'UTC'
                    : 'UTC'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500">Email Notifications</div>
                <div className="text-slate-200">
                  {typeof profile.preferences === 'object' && profile.preferences !== null 
                    ? ((profile.preferences as any).emailNotifications ? 'Enabled' : 'Disabled')
                    : 'Enabled'}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
