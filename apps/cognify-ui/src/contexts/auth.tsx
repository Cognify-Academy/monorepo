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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const clearError = () => setError(null);

  const decodeTokenAndSetUser = (token: string) => {
    // Check if token exists and is a valid string
    if (!token || typeof token !== "string") {
      console.error("Invalid token provided to decodeTokenAndSetUser:", token);
      setUser(null);
      setAccessToken(null);
      return;
    }

    try {
      // Check if token has the expected JWT format (header.payload.signature)
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        console.error("Invalid JWT token format:", token);
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
      console.error("Error decoding token:", error);
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

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Checking authentication...");
      const response = await apiClient.refresh();
      console.log("Refresh response:", response);

      // Only decode token if it exists and is valid
      if (response && response.token) {
        console.log("Token found, decoding...");
        decodeTokenAndSetUser(response.token);
      } else {
        console.warn("No token received from refresh endpoint");
        setUser(null);
        setAccessToken(null);
      }
    } catch (error) {
      console.log("Auth check error caught:", error);
      // If it's a 401 error from the refresh endpoint, this means no valid refresh token
      // This is normal for new users or when the refresh token has expired
      if (error instanceof ApiError && error.status === 401) {
        // Don't clear user state - user might still have a valid access token
        // Only clear if we explicitly need to logout
        console.log("No valid refresh token found - user not authenticated");
      } else if (error instanceof ApiError && error.status === 0) {
        // Network error - backend might be down
        console.warn("Backend connection failed during auth check");
      } else {
        console.error("Auth check error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const login = async (handle: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiClient.login(handle, password);

      // Only decode token if it exists and is valid
      if (response && response.token) {
        decodeTokenAndSetUser(response.token);
      } else {
        console.error("No token received from login endpoint");
        setError("Login failed - no token received");
        throw new Error("No token received from login");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 0) {
          setError("Unable to connect to server. Please try again later.");
        } else {
          setError(error.message);
        }
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

      // Only decode token if it exists and is valid
      if (response && response.token) {
        decodeTokenAndSetUser(response.token);
      } else {
        console.error("No token received from signup endpoint");
        setError("Signup failed - no token received");
        throw new Error("No token received from signup");
      }
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 0) {
          setError("Unable to connect to server. Please try again later.");
        } else {
          setError(error.message);
        }
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

      window.location.href = "/";
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
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
