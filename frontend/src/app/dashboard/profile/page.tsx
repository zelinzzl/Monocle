"use client"
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/UI/card";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { Button } from "@/components/UI/button";
import { Switch } from "@/components/UI/switch";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    bio: "Frontend developer with a love for clean UI.",
    picture: "https://example.com/avatar.jpg",
    emailNotifications: true,
    twoFactorAuth: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleToggle = (key: "emailNotifications" | "twoFactorAuth") => {
    setProfile((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  const handleSubmit = () => {
    console.log("Updated profile:", profile);
    setIsEditing(false);
  };

  return (
    <main className="flex flex-1 justify-center p-4 md:p-8 w-full">
      <Card className="w-full max-w-6xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Profile</CardTitle>
          <div className="space-x-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleEditToggle}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Save Changes</Button>
              </>
            ) : (
              <Button onClick={handleEditToggle}>Change Information</Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Column 1 */}
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
                <img
                  src={profile.picture}
                  alt="Profile preview"
                  className="mt-2 h-32 w-32 rounded-full object-cover border"
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

              {/* <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={profile.password}
                  onChange={handleChange}
                  disabled={!isEditing}
                />
              </div> */}
            </div>

            {/* Column 2 */}
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
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={profile.emailNotifications}
                  onCheckedChange={() => isEditing && handleToggle("emailNotifications")}
                  disabled={!isEditing}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <Switch
                  id="twoFactorAuth"
                  checked={profile.twoFactorAuth}
                  onCheckedChange={() => isEditing && handleToggle("twoFactorAuth")}
                  disabled={!isEditing}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
