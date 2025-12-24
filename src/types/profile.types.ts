import type { UserProfile as DBUserProfile, UserRole as DBUserRole } from '../lib/db/schema';

// Re-export database types
export type UserProfile = DBUserProfile;
export type UserRole = DBUserRole;

// Social links interface
export type SocialLinks = {
  twitter?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
};

// User preferences interface
export type UserPreferences = {
  emailNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  language: string;
};

// API Request types
export type UpdateProfileRequest = {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  bio?: string;
  organization?: string;
  website?: string;
  socialLinks?: Partial<SocialLinks>;
  preferences?: Partial<UserPreferences>;
};

export type CreateProfileRequest = {
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role?: UserRole;
  preferences?: UserPreferences;
};

export type UploadProfilePictureRequest = {
  file: File;
};

export type ProfilePictureResponse = {
  url: string;
  thumbnailUrl?: string;
};

// Component prop types
export type UserAvatarProps = {
  user: Pick<UserProfile, 'displayName' | 'profilePicture'> & { id?: string };
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  className?: string;
};

export type ProfileDropdownProps = {
  user: UserProfile;
  onLogout: () => void;
  onProfileClick: () => void;
  onSettingsClick: () => void;
};

export type ProfileFormProps = {
  profile: UserProfile;
  onSubmit: (data: UpdateProfileRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};
