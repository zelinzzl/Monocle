export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePictureUrl?: string;
  created_at: string;
  role?: string;
  settings?: {
    emailNotifications?: boolean;
    twoFactorEnabled?: boolean;
  };
}