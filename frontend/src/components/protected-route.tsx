"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

// Loading component
function AuthLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

// Unauthorized component
function UnauthorizedRedirect() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Please wait while we redirect you to the login page.</p>
      </div>
    </div>
  );
}

export default function ProtectedRoute({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if we're not loading and user is not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || <AuthLoadingSpinner />;
  }

  // Show redirect message if not authenticated
  if (!isAuthenticated) {
    return <UnauthorizedRedirect />;
  }

  // Only render children if user is authenticated
  return <>{children}</>;
}