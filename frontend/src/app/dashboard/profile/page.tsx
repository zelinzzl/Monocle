"use client";
import { useState, useEffect } from "react";
import {
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/UI/card";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { Button } from "@/components/UI/button";
import { Switch } from "@/components/UI/switch";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  let baseUrl = "http://localhost:5000/api"
  const token = localStorage.getItem("accessToken");

  useEffect(() => {

    

    if (!token) return;

    fetch(baseUrl+"/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data?.user) {
          const u = data.data.user;
          setProfile({
            name: `${u.firstName} ${u.lastName}`,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            bio: u.bio || "",
            picture: u.profilePictureUrl || "",
            emailNotifications: u.settings?.emailNotifications ?? true,
            twoFactorAuth: u.settings?.twoFactorEnabled ?? false,
          });
        }
      })
      .catch((err) => console.error("Failed to load profile", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setProfile((prev: any) => ({ ...prev, [id]: value }));
    
    // Update firstName and lastName when name changes
    if (id === 'name') {
      const nameParts = value.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      setProfile((prev: any) => ({ 
        ...prev, 
        firstName, 
        lastName,
        name: value 
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
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
      // Cancel editing - reset any changes
      setSelectedFile(null);
      setError("");
      // Reload profile data

    
      if (token) {
        fetch(baseUrl+"/auth/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data?.user) {
              const u = data.data.user;
              setProfile({
                name: `${u.firstName} ${u.lastName}`,
                firstName: u.firstName,
                lastName: u.lastName,
                email: u.email,
                bio: u.bio || "",
                picture: u.profilePictureUrl || "",
                emailNotifications: u.settings?.emailNotifications ?? true,
                twoFactorAuth: u.settings?.twoFactorEnabled ?? false,
              });
            }
          });
      }
    }
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    

    

    if (!token) {
      setError("No authentication token found");
      setIsLoading(false);
      return;
    }

    try {
      let response;

      if (selectedFile) {
        // Update with photo using FormData
        const formData = new FormData();
        formData.append('firstName', profile.firstName || '');
        formData.append('lastName', profile.lastName || '');
        formData.append('email', profile.email || '');
        formData.append('bio', profile.bio || '');
        formData.append('profilePhoto', selectedFile);

        response = await fetch(baseUrl+'/auth/profile', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        // Text-only update using JSON
        const updateData = {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          bio: profile.bio || '',
        };

        response = await fetch(baseUrl+'/auth/profile', {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
      }

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Profile updated successfully:", data);
        
        // Update local profile state with server response
        if (data.data?.user) {
          const u = data.data.user;
          setProfile({
            name: `${u.firstName} ${u.lastName}`,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email,
            bio: u.bio || "",
            picture: u.profilePictureUrl || "",
            emailNotifications: u.settings?.emailNotifications ?? true,
            twoFactorAuth: u.settings?.twoFactorEnabled ?? false,
          });
        }
        
        setIsEditing(false);
        setSelectedFile(null);
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Network error occurred while updating profile");
    } finally {
      setIsLoading(false);
    }
  };

  if (!profile) {
    return <p className="p-6">Loading profile...</p>;
  }

  return (
    <main className="justify-center w-full">
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Profile</h2>
        </div>
      </div>

      <div className="w-full">
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-shrink-0">
              <img
                src={profile.picture}
                alt="Profile preview"
                className="h-100 w-100 rounded-2xl object-cover border"
              />
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

            <div className="flex-1">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="picture">Profile Picture URL</Label>
                    <Input
                      id="picture"
                      type="url"
                      value={profile.picture}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                    />
                  </div>

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
              <Button onClick={handleEditToggle}>Update Information</Button>
            )}
          </div>
        </CardFooter>
      </div>
    </main>
  );
}