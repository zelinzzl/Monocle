"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { User } from "@/types/supabase";

type AuthContextType = {
  user: User | null;
  login: (token: string, userData?: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean; // Add loading state
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = Cookies.get("authToken");
      if (token) {
        try {
          setIsAuthenticated(true);
        } catch (error) {
          Cookies.remove("authToken");
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (token: string, userData?: User) => {
    Cookies.set("authToken", token, { expires: 7 });
    if (userData) {
      setUser(userData);
    }
    setIsAuthenticated(true);
    router.push("/dashboard");
  };

  const logout = () => {
    Cookies.remove("authToken");
    setIsAuthenticated(false);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
