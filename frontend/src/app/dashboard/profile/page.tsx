"use client"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/UI/card";
import { Label } from "@/components/UI/label";
import { Input } from "@/components/UI/input";
import { Textarea } from "@/components/UI/textarea";
import { Button } from "@/components/UI/button";
import { useState } from "react";

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    password: "password123",
    bio: "Frontend developer with a love for clean UI.",
    picture: "https://example.com/avatar.jpg",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setProfile((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = () => {
    // Add save logic here
    console.log("Updated profile:", profile);
  };

  return (
    <main className="flex flex-1 justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us something about yourself"
            />
          </div>

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
              className="mt-2 h-24 w-24 rounded-full object-cover border"
            />
          </div>

          <Button onClick={handleSubmit} className="mt-4">
            Save Changes
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

