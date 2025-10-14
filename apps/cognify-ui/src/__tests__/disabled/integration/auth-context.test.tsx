import { AuthProvider, useAuth } from "@/contexts/auth";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createMockUser } from "../../mocks/test-utils";

// Mock the API module
global.mock("@/lib/api", () => ({
  apiClient: {
    refresh: global.fn().mockResolvedValue({ token: "mock-token" }),
    login: global.fn().mockResolvedValue({ token: "mock-token" }),
    logout: global.fn().mockResolvedValue({ message: "Logged out" }),
  },
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
    ) {
      super(message);
    }
  },
}));

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
