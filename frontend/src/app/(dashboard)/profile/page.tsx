"use client";
import { useState, useEffect } from "react";
import {
  CardFooter,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Icon } from "@/components/ui/icons/Icon";
import { useAuth } from "@/context/auth-context";
import { updateProfile, updateProfileWithPhoto, updateSettings } from "@/services/updateProfileService";

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // 🔥 NEW: Auto-close messages after 10 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage("");
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError("");
      }, 10000); // 10 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // 🔥 FIXED: Load profile with separate name fields
  useEffect(() => {
    if (user) {
      console.log('Loading profile from auth context:', user);
      setProfile({
        firstName: user.firstName || '',      // ✅ Separate field
        lastName: user.lastName || '',        // ✅ Separate field
        email: user.email || '',
        picture: user.profilePictureUrl || user.profilePhoto || '',
        emailNotifications: user.settings?.emailNotifications ?? true,
        twoFactorAuth: user.settings?.twoFactorEnabled ?? false,
      });
    }
  }, [user]);

  // 🔥 SIMPLIFIED: Handle input changes (no name splitting logic)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError("File must be JPG, PNG, GIF, or WebP format");
        return;
      }
      
      setSelectedFile(file);
      setError("");
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfile((prev: any) => ({ ...prev, picture: previewUrl }));
    }
  };

  const handleToggle = (key: "emailNotifications" | "twoFactorAuth") => {
    setProfile((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to auth context data
      setSelectedFile(null);
      setError("");
      setSuccessMessage("");
      
      // 🔥 FIXED: Reset with separate name fields
      if (user) {
        setProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          picture: user.profilePictureUrl || user.profilePhoto || '',
          emailNotifications: user.settings?.emailNotifications ?? true,
          twoFactorAuth: user.settings?.twoFactorEnabled ?? false,
        });
      }
    }
    setIsEditing((prev) => !prev);
  };

  // 🔥 FIXED: Submit with proper field names
  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      let result;

      // 🔥 FIXED: Send firstName and lastName directly
      const profileData = {
        firstName: profile.firstName?.trim() || '',
        lastName: profile.lastName?.trim() || '',
        email: profile.email?.trim() || '',
      };

      console.log('Sending profile data:', profileData);

      if (selectedFile) {
        // Update with photo
        result = await updateProfileWithPhoto({
          ...profileData,
          profilePhoto: selectedFile,
        });
      } else {
        // Text-only update
        result = await updateProfile(profileData);
      }

      if (result.error) {
        setError(result.error);
        return;
      }

      // Update settings if they changed
      const currentEmailNotif = user?.settings?.emailNotifications ?? true;
      const currentTwoFactor = user?.settings?.twoFactorEnabled ?? false;

      if (profile.emailNotifications !== currentEmailNotif || 
          profile.twoFactorAuth !== currentTwoFactor) {
        
        console.log('Updating settings...');
        const settingsResult = await updateSettings({
          emailNotifications: profile.emailNotifications,
          twoFactorEnabled: profile.twoFactorAuth,
        });

        if (settingsResult.error) {
          setError(`Profile updated but settings failed: ${settingsResult.error}`);
          return;
        }
      }

      setSuccessMessage("Profile updated successfully!");
      setIsEditing(false);
      setSelectedFile(null);

    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError("Network error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading and auth checks
  if (!isAuthenticated) {
    return <p className="p-6">Please log in to view your profile.</p>;
  }

  if (!profile) {
    return <p className="p-6">Loading profile...</p>;
  }

  // Helper function to determine if we have a valid photo
  const hasValidPhoto = profile.picture && profile.picture.trim() !== '';

  return (
    <main className="justify-center w-full">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Profile</h2>
          <p className="text-sm text-muted-foreground">
            {user?.email} • {user?.firstName} {user?.lastName}
          </p>
        </div>
      </div>

      <div className="w-full">
        <CardContent>
          {/* 🔥 UPDATED: Success Message with Close Button */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded flex items-center justify-between">
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-4 text-green-700 hover:text-green-900 focus:outline-none"
                aria-label="Close success message"
              >
                <Icon name="XCircle" size="sm" />
              </button>
            </div>
          )}
          
          {/* 🔥 UPDATED: Error Message with Close Button */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-4 text-red-700 hover:text-red-900 focus:outline-none"
                aria-label="Close error message"
              >
                <Icon name="XCircle" size="sm" />
              </button>
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Photo Section */}
            <div className="flex-shrink-0">
              {hasValidPhoto ? (
                <img
                  src={profile.picture}
                  alt="Profile photo"
                  className="h-32 w-32 rounded-2xl object-cover border"
                  onError={(e) => {
                    const container = e.target as HTMLImageElement;
                    container.style.display = 'none';
                    if (container.nextElementSibling) {
                      (container.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              
              {/* Icon fallback */}
              <div 
                className={`h-32 w-32 rounded-2xl border bg-muted flex items-center justify-center ${hasValidPhoto ? 'hidden' : 'flex'}`}
              >
                <Icon name="User" size="xl" className="text-muted-foreground" />
              </div>

              {isEditing && (
                <div className="mt-4 space-y-2">
                  <Label htmlFor="profilePhoto">Upload New Photo</Label>
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500">
                    Max 5MB. Supported: JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </div>

            {/* Profile Form Section */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  {/* 🔥 FIXED: Separate First Name and Last Name inputs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter first name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="Enter last name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Settings</h3>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications">
                        Email Notifications
                      </Label>
                      <Switch
                        id="emailNotifications"
                        checked={profile.emailNotifications}
                        onCheckedChange={() =>
                          isEditing && handleToggle("emailNotifications")
                        }
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label htmlFor="twoFactorAuth">
                        Two-Factor Authentication
                      </Label>
                      <Switch
                        id="twoFactorAuth"
                        checked={profile.twoFactorAuth}
                        onCheckedChange={() =>
                          isEditing && handleToggle("twoFactorAuth")
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Account Info */}
                  <div className="pt-4 border-t">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Account Info</h4>
                    <p className="text-sm text-muted-foreground">
                      Member since: {new Date(user?.createdAt || '').toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-row items-center justify-between">
          <div></div>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleEditToggle} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={handleEditToggle}>
                Update Information
              </Button>
            )}
          </div>
        </CardFooter>
      </div>
    </main>
  );
}