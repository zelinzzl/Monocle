"use client";
import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { User } from "@/types/supabase"; // Assuming you have a `User` type for user info

type AuthContextType = {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if the token exists in cookies
    const token = Cookies.get("authToken");
    const storedUser = Cookies.get("user");

    // If there's a token and user data, set authenticated state and user info
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser)); // Parse the user data stored in cookies
    }
  }, []);

  const login = (token: string, user: User) => {
    // Store the token and user info in cookies
    Cookies.set("authToken", token, { expires: 7 });
    Cookies.set("user", JSON.stringify(user), { expires: 7 }); // Store user data

    setIsAuthenticated(true);
    setUser(user); // Set the user state
    router.push("/dashboard"); // Redirect to dashboard
  };

  const logout = () => {
    Cookies.remove("authToken");
    Cookies.remove("user");

    setIsAuthenticated(false);
    setUser(null); // Clear user state
    router.push("/"); // Redirect to home
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
