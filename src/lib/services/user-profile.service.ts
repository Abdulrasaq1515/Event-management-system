import { eq } from 'drizzle-orm';
import { db } from '../db/connection';
import { userProfiles, type UserProfile, type NewUserProfile } from '../db/schema';
import { AppError, ErrorCode } from '../utils/error-handler';

export class UserProfileService {
  async findById(id: string): Promise<UserProfile | null> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, id))
      .limit(1);
    
    return profile || null;
  }

  async findByEmail(email: string): Promise<UserProfile | null> {
    const [profile] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.email, email))
      .limit(1);
    
    return profile || null;
  }

  async create(data: NewUserProfile): Promise<UserProfile> {
    const profileData: NewUserProfile = {
      ...data,
      displayName: data.displayName || `${data.firstName} ${data.lastName}`,
      preferences: data.preferences || {
        emailNotifications: true,
        theme: 'system',
        timezone: 'UTC',
        language: 'en'
      }
    };

    await db.insert(userProfiles).values(profileData);
    
    // Fetch the created profile
    const createdProfile = await this.findByEmail(data.email);
    if (!createdProfile) {
      throw new AppError(
        ErrorCode.DATABASE_ERROR,
        'Failed to create profile',
        500
      );
    }
    
    return createdProfile;
  }

  async update(id: string, data: Partial<NewUserProfile>): Promise<UserProfile> {
    const updateData = {
      ...data,
      updatedAt: new Date(),
    };

    await db
      .update(userProfiles)
      .set(updateData)
      .where(eq(userProfiles.id, id));

    const profile = await this.findById(id);
    if (!profile) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Profile not found', 404);
    }

    return profile;
  }

  async updateProfilePicture(id: string, pictureUrl: string): Promise<UserProfile> {
    await db
      .update(userProfiles)
      .set({ 
        profilePicture: pictureUrl,
        updatedAt: new Date()
      })
      .where(eq(userProfiles.id, id));

    const profile = await this.findById(id);
    if (!profile) {
      throw new AppError(ErrorCode.NOT_FOUND, 'Profile not found', 404);
    }

    return profile;
  }

  async updateLastLogin(id: string): Promise<void> {
    await db
      .update(userProfiles)
      .set({ lastLoginAt: new Date() })
      .where(eq(userProfiles.id, id));
  }

  async delete(id: string): Promise<void> {
    await db
      .delete(userProfiles)
      .where(eq(userProfiles.id, id));
  }

  getInitials(displayName: string): string {
    return displayName
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  generateAvatarColor(id: string): string {
    // Generate consistent color based on user ID
    const colors = [
      '#3b82f6', // blue
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#f59e0b', // amber
      '#10b981', // green
      '#06b6d4', // cyan
    ];
    
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }
}

export const userProfileService = new UserProfileService();
