import { supabase } from "@/lib/supabaseClient";
import { apiFetch } from "./api";
import { User } from "@/types/supabase";

interface ProfileResponse {
  data?: any;
  error?: string;
  message?: string;
  user?: User;
}

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface ProfileWithPhotoUpdateData extends ProfileUpdateData {
  profilePhoto?: File;
}

interface SettingsUpdateData {
  theme?: 'light' | 'dark';
  emailNotifications?: boolean;
  twoFactorEnabled?: boolean;
}

/**
 * Fetches the user's profile from the backend
 * @returns Promise<ProfileResponse>
 */
export async function getProfile(): Promise<ProfileResponse> {
  try {
    const response = await apiFetch("/api/auth/profile", {
      method: "GET",
    });

    if (!response?.success) {
      return { 
        error: response?.error || 'Failed to fetch profile' 
      };
    }

    if (!response.data?.user) {
      return { 
        error: 'User data not found in response' 
      };
    }

    return {
      user: response.data.user,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred while fetching profile';
    return { 
      error: errorMessage 
    };
  }
}

/**
 * Updates the user's profile information
 * @param data ProfileUpdateData
 * @returns Promise<ProfileResponse>
 */
export async function updateProfile(data: ProfileUpdateData): Promise<ProfileResponse> {
  try {
    if (!data.firstName && !data.lastName && !data.email) {
      return { 
        error: 'No valid fields provided for update' 
      };
    }

    const response = await apiFetch("/api/auth/profile", {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response?.success) {
      return { 
        error: response?.error || 'Failed to update profile' 
      };
    }

    return {
      user: response.data?.user,
      message: response.message || 'Profile updated successfully',
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred while updating profile';
    return { 
      error: errorMessage 
    };
  }
}

/**
 * Updates the user's profile including profile photo
 * @param data ProfileWithPhotoUpdateData
 * @returns Promise<ProfileResponse>
 */
export async function updateProfileWithPhoto(data: ProfileWithPhotoUpdateData): Promise<ProfileResponse> {
  try {
    let photoUrl: string | undefined;

    // Handle profile photo upload if provided
    if (data.profilePhoto) {
      const uploadResult = await uploadProfilePhoto(data.profilePhoto);
      if (uploadResult.error) {
        return { 
          error: uploadResult.error 
        };
      }
      photoUrl = uploadResult.photoUrl;
    }

    // Prepare profile update data
    const profileUpdate: ProfileUpdateData & { profilePhotoUrl?: string } = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      ...(photoUrl && { profilePhotoUrl: photoUrl }),
    };

    // Update profile with the combined data
    return await updateProfile(profileUpdate);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred while updating profile with photo';
    return { 
      error: errorMessage 
    };
  }
}

/**
 * Helper function to upload profile photo to Supabase storage
 * @param file File to upload
 * @returns Promise<{ photoUrl?: string, error?: string }>
 */
async function uploadProfilePhoto(file: File): Promise<{ photoUrl?: string, error?: string }> {
  try {
    // 1. First attempt to get user
    // eslint-disable-next-line prefer-const
    let { data: { user }, error: userError } = await supabase.auth.getUser();
    
    // 2. If no user, try to recover session
    if (userError || !user) {
      console.log('Attempting session recovery...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.log('No session found, attempting to refresh...');
        const { data: { session: refreshedSession }, error: refreshError } = 
          await supabase.auth.refreshSession();
        
        if (refreshError || !refreshedSession) {
          return { error: 'Please log in again to continue' };
        }
        user = refreshedSession.user;
      } else {
        user = session.user;
      }
    }

    // 3. Verify we now have a user
    if (!user) {
      return { error: 'Authentication failed' };
    }

    // 4. Proceed with file upload
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("profile-photos")
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { error: `Photo upload failed: ${uploadError.message}` };
    }

    // 5. Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(fileName);

    return { photoUrl: publicUrl };
  } catch (error: unknown) {
    console.error('Upload error:', error);
    return { error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

/**
 * Updates the user's settings
 * @param data SettingsUpdateData
 * @returns Promise<ProfileResponse>
 */
export async function updateSettings(data: SettingsUpdateData): Promise<ProfileResponse> {
  try {
    if (!data.theme && !data.emailNotifications && !data.twoFactorEnabled) {
      return { 
        error: 'No valid settings provided for update' 
      };
    }

    const response = await apiFetch("/api/auth/settings", {
      method: "PUT",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response?.success) {
      return { 
        error: response?.error || 'Failed to update settings' 
      };
    }

    return {
      data: response.data?.settings,
      message: response.message || 'Settings updated successfully',
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unknown error occurred while updating settings';
    return { 
      error: errorMessage 
    };
  }
}