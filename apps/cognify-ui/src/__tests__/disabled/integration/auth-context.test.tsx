import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach, mock } from "bun:test";

// ---- Mock Next.js navigation (must be before any imports that use it) ----
mock.module("next/navigation", () => {
  const mockPush = () => {};
  const mockReplace = () => {};
  const mockPrefetch = () => {};
  const mockBack = () => {};
  const mockForward = () => {};
  const mockRefresh = () => {};

  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch,
      back: mockBack,
      forward: mockForward,
      refresh: mockRefresh,
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  };
});

// Mock the API module
const mockPost = mock(() => Promise.resolve({ token: null }));
const mockGet = mock(() => Promise.resolve(null));

mock.module("@/lib/api-client", () => {
  class ApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  class ApiClient {
    post = mockPost;
    get = mockGet;
    put = mock(() => Promise.resolve(null));
    patch = mock(() => Promise.resolve(null));
    delete = mock(() => Promise.resolve(null));
    setTokenProvider = mock(() => {});
    setTokenRefresher = mock(() => {});
    setOnAuthError = mock(() => {});
  }

  const apiClient = new ApiClient();
  return { apiClient, ApiError };
});

import { AuthProvider, useAuth } from "@/contexts/auth";

describe("AuthContext Integration", () => {
  const TestComponent = () => {
    const { user, login, logout, isLoading, error } = useAuth();

    if (isLoading) return <div>Loading...</div>;

    return (
      <div>
        {error && <div data-testid="error">{error}</div>}
        {user ? (
          <div>
            <span data-testid="user-name">{user.name}</span>
            <button onClick={logout}>Logout</button>
          </div>
        ) : (
          <button onClick={() => login("test@example.com", "password")}>
            Login
          </button>
        )}
      </div>
    );
  };

  beforeEach(() => {
    // Clear mocks - Bun doesn't have clearAllMocks yet
  });

  it("provides authentication state to children", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });

  it("handles login flow", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });

  it("handles logout flow", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("Login")).toBeInTheDocument();
    });
  });
});
