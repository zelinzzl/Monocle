
import { apiFetch } from "./api";
import { User } from "@/types/supabase";

interface ProfileResponse {
  data?: any;
  error?: string;
  message?: string;
  user?: User;
}

// Get user profile from backend
export async function getProfile(): Promise<ProfileResponse> {
  try {
    const response = await apiFetch("/api/auth/profile", {
      method: "GET",
    });

    if (!response.success) {
      return { error: response.error || 'Failed to get profile' };
    }

    return {
      user: response.data.user,
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to get profile' };
  }
}

// Update profile
export async function updateProfile(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): Promise<ProfileResponse> {
  try {
    const response = await apiFetch("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      return { error: response.error || 'Failed to update profile' };
    }

    return {
      user: response.data.user,
      message: response.message,
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' };
  }
}

// Update profile with photo
export async function updateProfileWithPhoto(data: {
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePhoto?: File;
}): Promise<ProfileResponse> {
  try {
    const formData = new FormData();
    
    // Add text fields 
    if (data.firstName) formData.append('firstName', data.firstName);
    if (data.lastName) formData.append('lastName', data.lastName);
    if (data.email) formData.append('email', data.email);
    
    // Add photo file
    if (data.profilePhoto) {
      formData.append('profilePhoto', data.profilePhoto);
    }

    const response = await apiFetch("/api/auth/profile", {
      method: "PUT",
      body: formData,
      headers: {}, // Let browser set content-type for FormData
    });

    if (!response.success) {
      return { error: response.error || 'Failed to update profile' };
    }

    return {
      user: response.data.user,
      message: response.message,
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to update profile' };
  }
}

// Update settings
export async function updateSettings(data: {
  theme?: 'light' | 'dark';
  emailNotifications?: boolean;
  twoFactorEnabled?: boolean;
}): Promise<ProfileResponse> {
  try {
    const response = await apiFetch("/api/auth/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      return { error: response.error || 'Failed to update settings' };
    }

    return {
      data: response.data.settings,
      message: response.message,
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to update settings' };
  }
}