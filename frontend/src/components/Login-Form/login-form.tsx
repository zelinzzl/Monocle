"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { P } from "../ui/typography";
import { loginUser } from "@/services/auth";
import { useAuth } from "@/context/auth-context";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const result = await loginUser(formData);

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.tokens?.accessToken || !result.user) {
        throw new Error("Login failed. Invalid response from server.");
      }

      // Store tokens and user data in the context
      // The refresh token is automatically stored in httpOnly cookie by the backend
      login(result.tokens.accessToken, result.tokens.refreshToken, result.user);

      setSuccessMessage("Login successful! Redirecting to your dashboard...");
      
      // No need for setTimeout, the login function handles redirect
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.message?.includes('Too many requests') || err.message?.includes('429')) {
        setError("Too many login attempts. Please wait a moment and try again.");
      } else if (err.message?.includes('Invalid credentials') || err.message?.includes('401')) {
        setError("Invalid email or password. Please check your credentials and try again.");
      } else if (err.message?.includes('Network')) {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(err.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm text-center p-2 rounded bg-red-50 border border-red-200">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="text-green-600 text-sm text-center p-2 rounded bg-green-50 border border-green-200">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="email"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="current-password"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="text-center text-sm">
        <Link href="#" className="text-primary hover:underline">
          Forgot your password?
        </Link>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          disabled={isLoading}>
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          disabled={isLoading}>
          Continue with GitHub
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <P>Don&apos;t have an account?</P>
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </div>
    </div>
  );
}