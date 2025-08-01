"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types/supabase";

type AuthContextType = {
  user: User | null;
  accessToken: string | null;
  login: (accessToken: string, refreshToken: string, user: User) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  login: () => {},
  logout: () => {},
  refreshAccessToken: async () => false,
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshingRef = useRef<boolean>(false);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scheduleTokenRefresh = useCallback((token: string) => {
    try {
      // Decode JWT to get expiration time
      const payload = JSON.parse(atob(token.split(".")[1]));
      const expirationTime = payload.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expirationTime - currentTime;

      // Schedule refresh 5 minutes before expiry
      const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 60000); // At least 1 minute

      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        refreshAccessToken();
      }, refreshTime);

      console.log(
        `Token refresh scheduled in ${Math.round(refreshTime / 1000 / 60)} minutes`
      );
    } catch (error) {
      console.error("Error scheduling token refresh:", error);
    }
  }, []);

  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    if (refreshingRef.current) {
      console.log("Refresh already in progress, skipping...");
      return false;
    }

    refreshingRef.current = true;

    try {
      console.log("Attempting token refresh...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Refresh response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Refresh failed:", errorData);
        throw new Error(`Token refresh failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log("Refresh response data:", data);

      if (data.success && data.data.accessToken) {
        console.log("Token refresh successful, updating access token");
        setAccessToken(data.data.accessToken);
        scheduleTokenRefresh(data.data.accessToken);
        return true;
      } else {
        throw new Error("Invalid refresh response");
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    } finally {
      refreshingRef.current = false;
    }
  }, [scheduleTokenRefresh]);

  const login = useCallback(
    (accessToken: string, refreshToken: string, user: User) => {
      console.log("Login called with user:", user);

      setAccessToken(accessToken);
      setUser(user);
      setIsAuthenticated(true);
      setIsLoading(false);

      scheduleTokenRefresh(accessToken);

      console.log("Login successful, redirecting to dashboard");
      router.push("/home");
    },
    [router, scheduleTokenRefresh]
  );

  const logout = useCallback(async () => {
    console.log("Logout called");

    try {
      if (accessToken) {
        await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API call failed:", error);
    }

    // Clear all client-side state
    setAccessToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);

    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    console.log("Logout complete, redirecting to home");
    router.push("/");
  }, [accessToken, router]);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("Initializing auth...");

      try {
        // Try to refresh token on app initialization
        const refreshSuccess = await refreshAccessToken();

        if (refreshSuccess) {
          console.log("Token refresh successful during initialization");
          // The refreshAccessToken already set the new access token
          // Now we need to get the user profile with the NEW token
          // We'll handle this in a separate effect that watches accessToken changes
        } else {
          console.log("No valid refresh token found or refresh failed");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []); // Remove dependencies to run only once

  // Separate effect to get user profile when accessToken changes
  useEffect(() => {
    const getUserProfile = async () => {
      if (!accessToken || isAuthenticated) {
        return; // Skip if no token or already authenticated
      }

      try {
        console.log("Getting user profile with access token...");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/profile`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            credentials: "include",
          }
        );

        console.log("Profile response status:", response.status);

        if (response.ok) {
          const userData = await response.json();
          console.log("Profile data received:", userData);

          if (userData.success) {
            setUser(userData.data.user);
            setIsAuthenticated(true);
          }
        } else {
          console.error("Profile request failed:", response.status);
          // Don't logout here, might be a temporary issue
        }
      } catch (error) {
        console.error("Get profile error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getUserProfile();
  }, [accessToken, isAuthenticated]); // Run when accessToken changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        refreshAccessToken,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
