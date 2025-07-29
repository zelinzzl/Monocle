"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import { Separator } from "@/components/UI/separator";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { P } from "../UI/typography";

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate login
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    router.push("/dashboard/");
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            required
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
        <Button variant="outline" className="w-full bg-transparent">
          Continue with Google
        </Button>
        <Button variant="outline" className="w-full bg-transparent">
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
