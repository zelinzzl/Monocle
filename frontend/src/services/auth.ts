import { User } from "@/types/supabase";
import { apiFetch } from "./api";

interface AuthResponse {
  data?: any;
  error?: string;
  message?: string;
  token?: string | undefined;
  user?: User;
}

export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> {
  const response = await apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (response.error) {
    return { error: response.error };
  }

  // If registration is successful, return token and user
  return {
    token: response.data.token,
    user: response.data.user,
  };
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const response = await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (response.error) {
    return { error: response.error };
  }

  // On successful login, return the token and user
  return {
    token: response.data.tokens.accessToken,
    user: response.data.user,
  };
}

export async function logoutUser(): Promise<AuthResponse> {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
}

export async function refreshToken(): Promise<AuthResponse> {
  return apiFetch("/api/auth/refresh", {
    method: "POST",
  });
}

export async function getProfile(): Promise<AuthResponse> {
  return apiFetch("/api/auth/profile", {
    method: "GET",
  });
}

export async function verifyToken(): Promise<AuthResponse> {
  return apiFetch("/api/auth/verify", {
    method: "GET",
  });
}

export async function updateProfile(
  data: Partial<{ name: string }>
): Promise<AuthResponse> {
  return apiFetch("/api/auth/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updateSettings(
  data: Record<string, any>
): Promise<AuthResponse> {
  return apiFetch("/api/auth/settings", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changePassword(data: {
  oldPassword: string;
  newPassword: string;
}): Promise<AuthResponse> {
  return apiFetch("/api/auth/change-password", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
