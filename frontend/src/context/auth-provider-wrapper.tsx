"use client";

import { useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/auth-context";
import { setAuthFunctions } from "@/services/api";

// This component connects the auth context to the API service
function AuthConnector({ children }: { children: React.ReactNode }) {
  const { accessToken, refreshAccessToken } = useAuth();

  useEffect(() => {
    // Provide the token getter and refresh function to the API service
    console.log('Setting up API auth functions with token:', accessToken ? 'present' : 'null');
    
    setAuthFunctions(
      () => accessToken,
      refreshAccessToken
    );
  }, [accessToken, refreshAccessToken]);

  return <>{children}</>;
}

// main wrapper that should be used in root layout
export function AuthProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthConnector>
        {children}
      </AuthConnector>
    </AuthProvider>
  );
}