"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/UI/card";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { Button } from "@/components/UI/button";
import { Switch } from "@/components/UI/switch";
import { useState } from "react";

export default function ProfilePage() {
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

  const handleSubmit = () => {
    console.log("Updated profile:", profile);
  };

  return (
    <main className="flex flex-1 justify-center p-4 md:p-8">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
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
                  placeholder="https://example.com/avatar.jpg"
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
                  placeholder="Your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={profile.password}
                  onChange={handleChange}
                  placeholder="Enter a secure password"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Tell us something about yourself"
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="emailNotifications">Email Notifications</Label>
                <Switch
                  id="emailNotifications"
                  checked={profile.emailNotifications}
                  onCheckedChange={() => handleToggle("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between space-y-2">
                <Label htmlFor="twoFactorAuth">Two-Factor Authentication</Label>
                <Switch
                  id="twoFactorAuth"
                  checked={profile.twoFactorAuth}
                  onCheckedChange={() => handleToggle("twoFactorAuth")}
                />
              </div>
            </div>
          </div>

          <Button onClick={handleSubmit} className="mt-6 hover:m">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
