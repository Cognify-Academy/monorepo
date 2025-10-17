"use client";

import { apiClient, ApiError } from "@/lib/api";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  login: (handle: string, password: string) => Promise<void>;
  signup: (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearError = () => setError(null);

  const decodeTokenAndSetUser = (token: string) => {
    if (!token || typeof token !== "string") {
      setUser(null);
      setAccessToken(null);
      return;
    }

    try {
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        setUser(null);
        setAccessToken(null);
        return;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      const userData: User = {
        id: payload.id,
        name: payload.name || payload.username,
        username: payload.username,
        email: payload.email || "",
        role: payload.roles?.[0] || "STUDENT",
        roles: payload.roles || ["STUDENT"],
      };
      setUser(userData);
      setAccessToken(token);
    } catch (error) {
      setUser(null);
      setAccessToken(null);
    }
  };

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles?.includes(role) || false;
    },
    [user?.roles],
  );

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const response = await apiClient.refresh();
        if (response?.token) {
          decodeTokenAndSetUser(response.token);
        }
      } catch (error) {
        // 401 is expected for unauthenticated users
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error("Auth initialization error:", error);
        }
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  const login = async (handle: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiClient.login(handle, password);

      if (response?.token) {
        decodeTokenAndSetUser(response.token);
      } else {
        setError("Login failed - no token received");
        throw new Error("No token received from login");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Login failed. Please try again.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string,
    username: string,
    email: string,
    password: string,
  ) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiClient.signup(name, username, email, password);

      if (response?.token) {
        decodeTokenAndSetUser(response.token);
      } else {
        setError("Signup failed - no token received");
        throw new Error("No token received from signup");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError("Signup failed. Please try again.");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setAccessToken(null);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    hasRole,
    login,
    signup,
    logout,
    error,
    clearError,
    accessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
