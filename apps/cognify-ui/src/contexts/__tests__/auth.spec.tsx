import { apiClient } from "@/lib/api";
import { act, render, waitFor } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "../auth";

jest.mock("@/lib/api", () => {
  return {
    apiClient: {
      refresh: jest.fn(),
      login: jest.fn(),
      signup: jest.fn(),
      logout: jest.fn(),
    },
    ApiError: class ApiError extends Error {
      constructor(
        message: string,
        public status?: number,
      ) {
        super(message);
        this.name = "ApiError";
      }
    },
  };
});

const mockedApi = apiClient as unknown as {
  refresh: jest.Mock;
  login: jest.Mock;
  signup: jest.Mock;
  logout: jest.Mock;
};

function base64Url(input: string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeToken(payloadObj: Record<string, any>) {
  const header = base64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = base64Url(JSON.stringify(payloadObj));
  const signature = ""; // not used in tests
  return `${header}.${payload}.${signature}`;
}

function TestConsumer({
  onReady,
}: {
  onReady: (ctx: ReturnType<typeof useAuth>) => void;
}) {
  const ctx = useAuth();
  React.useEffect(() => {
    onReady(ctx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

describe("AuthProvider getAccessToken & refresh behavior", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("initial refresh is called on mount and getAccessToken returns existing valid token", async () => {
    const validToken = makeToken({
      id: "1",
      username: "alice",
      exp: Math.floor(Date.now() / 1000) + 60 * 10,
    });

    // initial refresh returns a valid token
    mockedApi.refresh.mockResolvedValueOnce({ token: validToken });

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => (ctxRef = ctx)} />
        </AuthProvider>,
      );
    });

    await waitFor(() => {
      expect(ctxRef).not.toBeNull();
      expect(ctxRef!.isInitialized).toBe(true);
    });

    // getAccessToken should return the valid token and not call refresh again
    const token = await act(async () => ctxRef!.getAccessToken());
    expect(token).toBe(validToken);
    expect(mockedApi.refresh).toHaveBeenCalledTimes(1); // only the initial mount call
  });

  test("login sets an expired token and getAccessToken triggers refresh once (single-flight)", async () => {
    const expiredToken = makeToken({
      id: "2",
      username: "bob",
      exp: Math.floor(Date.now() / 1000) - 60, // already expired
    });
    const freshToken = makeToken({
      id: "2",
      username: "bob",
      exp: Math.floor(Date.now() / 1000) + 60 * 10,
    });

    // initial refresh (mount) returns null -> unauthenticated
    mockedApi.refresh.mockResolvedValueOnce(null);
    // subsequent refresh (when requested) will return freshToken
    mockedApi.refresh.mockImplementationOnce(async () => {
      // simulate small delay to allow concurrent callers to queue
      await new Promise((res) => setTimeout(res, 10));
      return { token: freshToken };
    });

    mockedApi.login.mockResolvedValueOnce({ token: expiredToken });

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => (ctxRef = ctx)} />
        </AuthProvider>,
      );
    });

    expect(ctxRef).not.toBeNull();
    // perform login which will set the expired token
    await act(async () => {
      await ctxRef!.login("bob", "password");
    });

    // token is expired so getAccessToken should trigger refresh.
    // Call twice concurrently to assert single-flight refresh
    const p1 = act(async () => ctxRef!.getAccessToken());
    const p2 = act(async () => ctxRef!.getAccessToken());

    const [t1, t2] = await Promise.all([p1, p2]);

    expect(t1).toBe(freshToken);
    expect(t2).toBe(freshToken);
    // initial mount refresh + single refresh during getAccessToken -> total 2 calls
    expect(mockedApi.refresh).toHaveBeenCalledTimes(2);
  });

  test("getAccessToken returns null when refresh fails and clears user", async () => {
    const expiredToken = makeToken({
      id: "3",
      username: "carl",
      exp: Math.floor(Date.now() / 1000) - 60,
    });

    // initial refresh returns null (unauthenticated)
    mockedApi.refresh.mockResolvedValueOnce(null);
    mockedApi.login.mockResolvedValueOnce({ token: expiredToken });
    // refresh during getAccessToken fails
    mockedApi.refresh.mockRejectedValueOnce(new Error("refresh failed"));

    let ctxRef: ReturnType<typeof useAuth> | null = null;
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onReady={(ctx) => (ctxRef = ctx)} />
        </AuthProvider>,
      );
    });

    // login sets expired token
    await act(async () => {
      await ctxRef!.login("carl", "pw");
    });

    // getAccessToken should attempt refresh, fail, clear user and return null
    const token = await act(async () => ctxRef!.getAccessToken());
    expect(token).toBeNull();
    expect(ctxRef!.isAuthenticated).toBe(false);
  });
});
