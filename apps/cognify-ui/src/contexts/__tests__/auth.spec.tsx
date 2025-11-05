import { act, render, waitFor } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  mock,
  test,
  vi,
} from "bun:test";
import React from "react";
import { AuthProvider, useAuth } from "../auth";

const setItemSpy = vi.spyOn(localStorage, "setItem");

// ---- Mock API (must be before import of module under test consumers) ----
mock.module("@/lib/api", () => {
  const apiClient = {
    refresh: mock(() => Promise.resolve(null)),
    login: mock(() => Promise.resolve(null)),
    signup: mock(() => Promise.resolve(null)),
    logout: mock(() => Promise.resolve(null)),
  };
  class ApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }
  return { apiClient, ApiError };
});

import { apiClient } from "@/lib/api";

const mockedApi = apiClient as unknown as {
  refresh: ReturnType<typeof mock>;
  login: ReturnType<typeof mock>;
  signup: ReturnType<typeof mock>;
  logout: ReturnType<typeof mock>;
};

// ---- Helpers ----
function base64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeToken(payload: Record<string, any>) {
  const header = base64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  return `${header}.${body}.`;
}

// Consumer to grab context; IMPORTANT: don't return anything from useEffect!
function TestConsumer({
  onReady,
}: {
  onReady: (ctx: ReturnType<typeof useAuth>) => void;
}) {
  const ctx = useAuth();
  React.useEffect(() => {
    onReady(ctx); // no return
  }, [ctx, onReady]);
  return null;
}

// Stub window.location.href set (logout writes to it)
let originalLocation: Location;
beforeEach(() => {
  localStorage.clear();
  mockedApi.refresh.mockReset();
  mockedApi.login.mockReset();
  mockedApi.signup.mockReset();
  mockedApi.logout.mockReset();

  originalLocation = window.location;
  // Define a writable stub for the test run
  // @ts-expect-error override for tests
  delete (window as any).location;
  // Minimal stub: keep origin fields but intercept href set
  Object.defineProperty(window, "location", {
    configurable: true,
    value: {
      ...originalLocation,
      get href() {
        return originalLocation.href;
      },
      set href(_v: string) {
        // swallow redirects during tests
      },
    },
  });
});

afterEach(() => {
  // restore original location
  Object.defineProperty(window, "location", {
    configurable: true,
    value: originalLocation,
  });
});

describe("AuthProvider", () => {
  test("refresh on mount sets user and initialized", async () => {
    const validToken = makeToken({
      id: "1",
      username: "alice",
      exp: Math.floor(Date.now() / 1000) + 600,
    });
    mockedApi.refresh.mockResolvedValueOnce({ token: validToken });

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(() => {
      render(
        <AuthProvider>
          <TestConsumer
            onReady={(ctx) => {
              ctxRef = ctx;
            }}
          />
        </AuthProvider>,
      );
    });

    await waitFor(() => {
      expect(ctxRef).not.toBeNull();
      expect(ctxRef!.isInitialized).toBe(true);
    });

    expect(mockedApi.refresh).toHaveBeenCalledTimes(1);
    expect(ctxRef!.isAuthenticated).toBe(true);
    expect(ctxRef!.user?.username).toBe("alice");
  });

  test("login sets token and user", async () => {
    const token = makeToken({
      id: "2",
      username: "bob",
      exp: Math.floor(Date.now() / 1000) + 600,
    });
    mockedApi.refresh.mockResolvedValueOnce(null);
    mockedApi.login.mockResolvedValueOnce({ token });

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(() =>
      render(
        <AuthProvider>
          <TestConsumer
            onReady={(ctx) => {
              ctxRef = ctx;
            }}
          />
        </AuthProvider>,
      ),
    );

    await waitFor(() => expect(ctxRef?.isInitialized).toBe(true));

    await act(async () => {
      await ctxRef!.login("bob", "pw");
    });

    await waitFor(() => expect(ctxRef!.token).toBe(token));
    expect(setItemSpy).toHaveBeenCalledWith("accessToken", token);
    setItemSpy.mockRestore();
    expect(ctxRef!.isAuthenticated).toBe(true);
    expect(ctxRef!.user?.username).toBe("bob");
  });

  test("getAccessToken triggers refresh when no token present", async () => {
    const freshToken = makeToken({
      id: "3",
      username: "charlie",
      exp: Math.floor(Date.now() / 1000) + 600,
    });
    mockedApi.refresh.mockResolvedValueOnce(null); // init
    mockedApi.refresh.mockResolvedValueOnce({ token: freshToken }); // refresh during getAccessToken

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(() =>
      render(
        <AuthProvider>
          <TestConsumer
            onReady={(ctx) => {
              ctxRef = ctx;
            }}
          />
        </AuthProvider>,
      ),
    );

    await waitFor(() => expect(ctxRef?.isInitialized).toBe(true));

    const token = await ctxRef!.getAccessToken();
    expect(token).toBe(freshToken);
    await waitFor(() => expect(ctxRef!.user?.username).toBe("charlie"));
  });

  test("failed refresh returns null and leaves user unauthenticated", async () => {
    mockedApi.refresh.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(() =>
      render(
        <AuthProvider>
          <TestConsumer
            onReady={(ctx) => {
              ctxRef = ctx;
            }}
          />
        </AuthProvider>,
      ),
    );

    await waitFor(() => expect(ctxRef?.isInitialized).toBe(true));

    const token = await ctxRef!.getAccessToken();
    expect(token).toBeNull();
    expect(ctxRef!.isAuthenticated).toBe(false);
    expect(ctxRef!.user).toBeNull();
  });

  test("hasRole works from decoded token", async () => {
    const token = makeToken({
      id: "4",
      username: "dana",
      roles: ["STUDENT", "ADMIN"],
      exp: Math.floor(Date.now() / 1000) + 600,
    });
    mockedApi.refresh.mockResolvedValueOnce({ token });

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(() =>
      render(
        <AuthProvider>
          <TestConsumer
            onReady={(ctx) => {
              ctxRef = ctx;
            }}
          />
        </AuthProvider>,
      ),
    );

    await waitFor(() => expect(ctxRef?.isInitialized).toBe(true));
    expect(ctxRef!.hasRole("ADMIN")).toBe(true);
    expect(ctxRef!.hasRole("UNKNOWN")).toBe(false);
  });

  test("logout clears user and token and calls api logout", async () => {
    const token = makeToken({
      id: "5",
      username: "eve",
      exp: Math.floor(Date.now() / 1000) + 600,
    });
    mockedApi.refresh.mockResolvedValueOnce({ token });

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(() =>
      render(
        <AuthProvider>
          <TestConsumer
            onReady={(ctx) => {
              ctxRef = ctx;
            }}
          />
        </AuthProvider>,
      ),
    );

    await waitFor(() => expect(ctxRef?.isInitialized).toBe(true));

    await act(async () => {
      await ctxRef!.logout();
    });

    expect(mockedApi.logout).toHaveBeenCalled();
    expect(ctxRef!.user).toBeNull();
    expect(ctxRef!.token).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
