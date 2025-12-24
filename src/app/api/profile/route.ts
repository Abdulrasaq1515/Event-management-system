import { NextRequest, NextResponse } from 'next/server';
import { userProfileService } from '@/lib/services/user-profile.service';
import { optionalAuth } from '@/lib/auth/middleware';
import { ErrorCode } from '@/lib/utils/error-handler';

// GET /api/profile - Get current user's profile
export async function GET(request: NextRequest) {
  try {
    const auth = await optionalAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required', 
          code: ErrorCode.UNAUTHORIZED 
        },
        { status: 401 }
      );
    }

    const profile = await userProfileService.findById(auth.userId);
    
    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Profile not found', 
          code: ErrorCode.NOT_FOUND 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch profile', 
        code: ErrorCode.INTERNAL_ERROR 
      },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update current user's profile
export async function PUT(request: NextRequest) {
  try {
    const auth = await optionalAuth(request);
    
    if (!auth) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication required', 
          code: ErrorCode.UNAUTHORIZED 
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate that user can only update their own profile
    const profile = await userProfileService.findById(auth.userId);
    if (!profile) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Profile not found', 
          code: ErrorCode.NOT_FOUND 
        },
        { status: 404 }
      );
    }

    const updatedProfile = await userProfileService.update(auth.userId, body);

    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update profile', 
        code: ErrorCode.INTERNAL_ERROR 
      },
      { status: 500 }
    );
  }
}
