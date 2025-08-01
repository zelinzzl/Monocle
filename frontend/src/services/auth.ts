import { User } from "@/types/supabase";
import { apiFetch, authApiFetch } from "./api";

interface AuthResponse {
  data?: any;
  error?: string;
  message?: string;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
  };
  user?: User;
}

export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> {
  try {
    const response = await authApiFetch("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      return { error: response.error || 'Registration failed' };
    }

    // Return tokens and user data
    return {
      tokens: response.data.tokens,
      user: response.data.user,
    };
  } catch (error: any) {
    return { error: error.message || 'Registration failed' };
  }
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const response = await authApiFetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      return { error: response.error || 'Login failed' };
    }

    // Return tokens and user data
    return {
      tokens: response.data.tokens,
      user: response.data.user,
    };
  } catch (error: any) {
    return { error: error.message || 'Login failed' };
  }
}

export async function logoutUser(): Promise<AuthResponse> {
  try {
    const response = await apiFetch("/api/auth/logout", {
      method: "POST",
    });

    return { message: response.message || 'Logged out successfully' };
  } catch (error: any) {
    return { error: error.message || 'Logout failed' };
  }
}

export async function refreshToken(): Promise<AuthResponse> {
  try {
    const response = await authApiFetch("/api/auth/refresh", {
      method: "POST",
    });

    if (!response.success) {
      return { error: response.error || 'Token refresh failed' };
    }

    return {
      tokens: {
        accessToken: response.data.accessToken,
        refreshToken: '', // Refresh token is in httpOnly cookie
        expiresIn: response.data.expiresIn || '1h'
      }
    };
  } catch (error: any) {
    return { error: error.message || 'Token refresh failed' };
  }
}

export async function getProfile(): Promise<AuthResponse> {
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

export async function verifyToken(): Promise<AuthResponse> {
  try {
    const response = await apiFetch("/api/auth/verify", {
      method: "GET",
    });

    if (!response.success) {
      return { error: response.error || 'Token verification failed' };
    }

    return {
      user: response.data.user,
    };
  } catch (error: any) {
    return { error: error.message || 'Token verification failed' };
  }
}

export async function updateProfile(data: FormData | {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
}): Promise<AuthResponse> {
  try {
    const isFormData = data instanceof FormData;
    
    const response = await apiFetch("/api/auth/profile", {
      method: "PUT",
      body: isFormData ? data : JSON.stringify(data),
      headers: isFormData ? {} : { "Content-Type": "application/json" },
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

export async function updateSettings(data: {
  theme?: 'light' | 'dark';
  emailNotifications?: boolean;
  twoFactorEnabled?: boolean;
}): Promise<AuthResponse> {
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

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<AuthResponse> {
  try {
    const response = await apiFetch("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify(data),
    });

    if (!response.success) {
      return { error: response.error || 'Failed to change password' };
    }

    return {
      message: response.message,
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to change password' };
  }
}