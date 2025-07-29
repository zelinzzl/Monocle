import { apiFetch } from "./api";

interface AuthResponse {
  data?: any;
  error?: string;
  message?: string;
}

export async function registerUser(data: {
  email: string;
  password: string;
  name?: string;
}): Promise<AuthResponse> {
  return apiFetch("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
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
