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

  useEffect(() => {
    //const token = localStorage.getItem("accessToken");
    console.log('Try to use local storage')

    if (!token) return;

    fetch("http://localhost:5000/api/auth/profile", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data)
        
        if (data.success && data.data?.user) {
          const u = data.data.user;
          setProfile({
            name: `${u.firstName} ${u.lastName}`,
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
  };

  const handleToggle = (key: "emailNotifications" | "twoFactorAuth") => {
    setProfile((prev: any) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = () => {
    console.log("Updated profile:", profile);
    setIsEditing(false);
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
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-shrink-0">
              <img
                src={profile.picture}
                alt="Profile preview"
                className="h-100 w-100 rounded-2xl object-cover border"
              />
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
                <Button variant="outline" onClick={handleEditToggle}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Save Changes</Button>
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
