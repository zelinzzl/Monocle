"use client";

import { useState } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Separator } from "@/components/UI/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { P } from "../UI/typography";
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

      if (!result.token || !result.user) {
        setError("Login failed. Check token or User.");
        return;
      }

      // Store token and user data in the context
      login(result.token, result.user);

      console.log(result.token);
      setSuccessMessage("Login successful! Redirecting to your dashboard...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError("Too many attempts. Please wait a moment and try again.");
      } else {
        setError(err.message || "Please check your credentials and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm text-center p-2 rounded bg-red-50">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="text-green-600 text-sm text-center p-2 rounded bg-green-50">
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
