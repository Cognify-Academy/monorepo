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
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean; // Add flag to track initialization state
  isAuthenticated: boolean;
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
  token: string | null;
  accessToken: string | null; // Alias for backwards compatibility
  getAccessToken: () => Promise<string | null>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Initialize from localStorage if available
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const refreshPromiseRef = React.useRef<Promise<string | null> | null>(null);

  const clearError = () => setError(null);

  // Sync token to localStorage whenever it changes
  React.useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [token]);

  // Decode JWT token to extract user info and check expiration
  const decodeToken = (token: string): User | null => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      // Check if token is expired
      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
          // Token is expired
          return null;
        }
      }

      return {
        id: payload.id,
        name: payload.name || payload.username,
        username: payload.username,
        email: payload.email || "",
        roles: payload.roles || ["STUDENT"],
      };
    } catch {
      return null;
    }
  };

  const hasRole = useCallback(
    (role: string): boolean => {
      return user?.roles?.includes(role) || false;
    },
    [user?.roles],
  );

  // Get current access token or refresh if needed
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    // If we have a valid token, return it
    if (token) {
      return token;
    }

    // If already refreshing, wait for that promise
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    // Start a new refresh
    refreshPromiseRef.current = (async () => {
      try {
        const response = await apiClient.refresh();
        if (response?.token) {
          setToken(response.token);
          setUser(decodeToken(response.token));
          return response.token;
        }
      } catch (error) {
        // Refresh failed
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
      return null;
    })();

    return refreshPromiseRef.current;
  }, [token]);

  // Initialize user from stored token or refresh
  useEffect(() => {
    const init = async () => {
      // If we have a stored token, decode it first
      if (token) {
        const decoded = decodeToken(token);
        if (decoded) {
          // Token is valid and not expired
          setUser(decoded);
          setIsInitialized(true);
          return;
        }
        // Token exists but is invalid or expired, clear it
        setToken(null);
        localStorage.removeItem("accessToken");
      }

      // No valid token, try to refresh using refresh token (httpOnly cookie)
      try {
        const response = await apiClient.refresh();
        if (response?.token) {
          setToken(response.token);
          setUser(decodeToken(response.token));
        }
      } catch (error) {
        // Not logged in, that's ok - suppress error
        // 401 is expected when user is not logged in
      } finally {
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  const login = async (handle: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiClient.login(handle, password);

      if (response?.token) {
        setToken(response.token);
        setUser(decodeToken(response.token));
      } else {
        throw new Error("No token received from API");
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Login failed";
      setError(message);
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
        setToken(response.token);
        setUser(decodeToken(response.token));
      }
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : "Signup failed";
      setError(message);
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
      setToken(null);
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
    login,
    signup,
    logout,
    error,
    clearError,
    token,
    accessToken: token, // Alias for backwards compatibility
    getAccessToken,
    hasRole,
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
