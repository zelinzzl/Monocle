"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/services/auth";
import { useAuth } from "@/context/auth-context";

export function SignupForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    // Check password complexity
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (!result.tokens?.accessToken || !result.user) {
        throw new Error("Registration failed. Invalid response from server.");
      }

      setSuccessMessage("Account created successfully! Redirecting to dashboard...");

      // Auto-login the user after successful registration
      // The refresh token is automatically stored in httpOnly cookie by the backend
      login(result.tokens.accessToken, result.tokens.refreshToken, result.user);

      // No need for setTimeout, the login function handles redirect
    } catch (err: any) {
      console.error('Registration error:', err);
      
      if (err.message?.includes('Too many requests') || err.message?.includes('429')) {
        setError("Too many registration attempts. Please wait a moment and try again.");
      } else if (err.message?.includes('already exists') || err.message?.includes('409')) {
        setError("An account with this email already exists. Please try logging in instead.");
      } else if (err.message?.includes('Network')) {
        setError("Network error. Please check your connection and try again.");
      } else if (err.message?.includes('Validation failed')) {
        setError("Please check your information and try again. Make sure your email is valid and password meets requirements.");
      } else {
        setError(err.message || "Registration failed. Please try again.");
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
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First name</Label>
            <Input
              id="firstName"
              placeholder="John"
              required
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last name</Label>
            <Input
              id="lastName"
              placeholder="Doe"
              required
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
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
            placeholder="Create a password"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters with uppercase, lowercase, and numbers
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="agreeToTerms"
            checked={formData.agreeToTerms}
            onCheckedChange={(checked: any) =>
              setFormData((prev) => ({
                ...prev,
                agreeToTerms: Boolean(checked),
              }))
            }
            required
            disabled={isLoading}
          />
          <Label htmlFor="agreeToTerms" className="text-sm">
            I agree to the{" "}
            <Link href="#" className="text-primary hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>

      <Separator />

      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full bg-transparent"
          disabled={isLoading}
        >
          Continue with Google
        </Button>
        <Button
          variant="outline"
          className="w-full bg-transparent"
          disabled={isLoading}
        >
          Continue with GitHub
        </Button>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}