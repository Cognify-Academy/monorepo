"use client";

import { ApiError, apiClient as newApiClient } from "@/lib/api-client";
import { setupApiClient } from "@/lib/api-integration";
import { useRouter } from "next/navigation";
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
  isInitialized: boolean;
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
  accessToken: string | null;
  getAccessToken: () => Promise<string | null>;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = () => setError(null);

  React.useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
  }, [token]);

  const decodeToken = (token: string): User | null => {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const payload = JSON.parse(atob(parts[1]));

      if (payload.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp < now) {
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

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await newApiClient.post<{ token: string }>(
        "/auth/refresh",
        {},
        { skipAuth: true },
      );
      if (response?.token) {
        setToken(response.token);
        setUser(decodeToken(response.token));
        return response.token;
      }
      return null;
    } catch {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
      }
      return null;
    }
  }, []);

  const getAccessToken = useCallback(async (): Promise<string | null> => {
    return token;
  }, [token]);

  useEffect(() => {
    setupApiClient(
      async () => token,
      refreshToken,
      () => {
        setUser(null);
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          router.push("/login");
        }
      },
    );
  }, [token, refreshToken, router]);

  useEffect(() => {
    const storedToken =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (storedToken) {
      const decoded = decodeToken(storedToken);
      if (decoded) {
        setToken(storedToken);
        setUser(decoded);
      } else {
        setToken(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
        }
      }
    }

    setIsInitialized(true);
  }, []);

  const login = async (handle: string, password: string) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await newApiClient.post<{ token: string }>(
        "/auth/login",
        { handle, password },
        { skipAuth: true },
      );

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
      const response = await newApiClient.post<{ token: string }>(
        "/auth/signup",
        { name, username, email, password },
        { skipAuth: true },
      );

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
      await newApiClient.post<{ message: string }>("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      setToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
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
    accessToken: token,
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
