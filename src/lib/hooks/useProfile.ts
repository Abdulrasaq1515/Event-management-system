import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UserProfile, UpdateProfileRequest } from '@/types/profile.types';

const API_BASE = '/api/profile';

// Fetch current user's profile
async function fetchProfile(): Promise<UserProfile> {
  const response = await fetch(API_BASE, {
    headers: {
      'x-organizer-id': 'dev-user-123', // Legacy auth header
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  const data = await response.json();
  return data.data;
}

// Update profile
async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await fetch(API_BASE, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-organizer-id': 'dev-user-123', // Legacy auth header
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Failed to update profile');
  }

  const result = await response.json();
  return result.data;
}

// Hook to fetch profile
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      // Update the cache with the new profile data
      queryClient.setQueryData(['profile'], data);
    },
  });
}

// Hook to upload profile picture
export function useUploadProfilePicture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/profile/picture', {
        method: 'POST',
        headers: {
          'x-organizer-id': 'dev-user-123', // Legacy auth header
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload profile picture');
      }

      const result = await response.json();
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate profile query to refetch with new picture
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
