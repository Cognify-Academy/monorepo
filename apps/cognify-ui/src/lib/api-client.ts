/**
 * Improved API Client with:
 * - Automatic token injection
 * - Automatic token refresh on 401
 * - Request retry logic
 * - Request cancellation
 * - Timeout handling
 * - Better error handling
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

const DEFAULT_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface RequestConfig extends RequestInit {
  timeout?: number;
  retries?: number;
  skipAuth?: boolean;
  signal?: AbortSignal;
  silent?: boolean; // If true, suppress error logging for expected failures
}

export type TokenProvider = () => Promise<string | null>;
export type TokenRefresher = () => Promise<string | null>;
export type OnAuthError = () => void;

class ApiClient {
  private baseUrl: string;
  private tokenProvider?: TokenProvider;
  private tokenRefresher?: TokenRefresher;
  private onAuthError?: OnAuthError;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Set token provider function
   */
  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  /**
   * Set token refresher function
   */
  setTokenRefresher(refresher: TokenRefresher) {
    this.tokenRefresher = refresher;
  }

  /**
   * Set callback for auth errors
   */
  setOnAuthError(callback: OnAuthError) {
    this.onAuthError = callback;
  }

  /**
   * Create a timeout promise
   */
  private createTimeout(timeout: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new ApiError("Request timeout", 408, "TIMEOUT"));
      }, timeout);
    });
  }

  /**
   * Sleep utility for retries
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Refresh token with deduplication
   */
  private async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.tokenRefresher) {
      return null;
    }

    const refresher = this.tokenRefresher;
    this.refreshPromise = (async () => {
      try {
        return await refresher();
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Get current token
   */
  private async getToken(): Promise<string | null> {
    if (!this.tokenProvider) {
      return null;
    }
    return this.tokenProvider();
  }

  /**
   * Make request with retry logic
   */
  private async makeRequestWithRetry<T>(
    url: string,
    config: RequestConfig,
    retries: number = MAX_RETRIES,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Create abort controller for this attempt
        const controller = new AbortController();
        const signal = config.signal
          ? AbortSignal.any([config.signal, controller.signal])
          : controller.signal;

        // Create timeout promise
        const timeout = config.timeout || DEFAULT_TIMEOUT;
        const timeoutPromise = this.createTimeout(timeout);

        // Make the request
        const requestPromise = fetch(url, {
          ...config,
          signal,
        });

        // Race between request and timeout
        const response = await Promise.race([requestPromise, timeoutPromise]);

        // Handle response
        if (!response.ok) {
          // Handle 401 - try to refresh token
          if (
            response.status === 401 &&
            this.tokenRefresher &&
            !config.skipAuth
          ) {
            // Only retry once for 401
            if (attempt === 0) {
              const newToken = await this.refreshToken();
              if (newToken) {
                // Retry with new token
                const newConfig = {
                  ...config,
                  headers: {
                    ...config.headers,
                    Authorization: `Bearer ${newToken}`,
                  },
                };
                return this.makeRequestWithRetry(url, newConfig, 0);
              }
            }

            // Refresh failed or already retried
            if (this.onAuthError) {
              this.onAuthError();
            }
            throw new ApiError("Authentication failed", 401, "UNAUTHORIZED");
          }

          // Parse error response
          let errorMessage = "Request failed";
          let errorCode: string | undefined;
          let errorData: unknown;

          try {
            const errorResponse = await response.json();
            errorMessage =
              errorResponse.error?.message ||
              errorResponse.error ||
              errorMessage;
            errorCode = errorResponse.error?.code;
            errorData = errorResponse;
          } catch {
            errorMessage = response.statusText || errorMessage;
          }

          throw new ApiError(
            errorMessage,
            response.status,
            errorCode,
            errorData,
          );
        }

        // Parse successful response
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          return await response.json();
        } else {
          return (await response.text()) as unknown as T;
        }
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof ApiError) {
          // Don't retry on 4xx errors (except 401 which is handled above)
          if (
            error.status >= 400 &&
            error.status < 500 &&
            error.status !== 401
          ) {
            throw error;
          }
          // Don't retry on timeout
          if (error.code === "TIMEOUT") {
            throw error;
          }
        }

        // Don't retry on abort
        if (error instanceof Error && error.name === "AbortError") {
          throw error;
        }

        // If this was the last attempt, throw the error
        if (attempt === retries) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        const delay = RETRY_DELAY * Math.pow(2, attempt);
        await this.sleep(delay);
      }
    }

    throw lastError || new Error("Request failed");
  }

  /**
   * Main request method
   */
  async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    // Get token if not skipping auth
    let token: string | null = null;
    if (!config.skipAuth) {
      token = await this.getToken();
    }

    // Build headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...config.headers,
    };

    // Add auth header if token is available
    if (token && !config.skipAuth) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Build request config
    const requestConfig: RequestConfig = {
      ...config,
      headers,
      credentials: "include",
    };

    // Make request with retry
    return this.makeRequestWithRetry<T>(url, requestConfig, config.retries);
  }

  /**
   * Convenience methods
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: "DELETE" });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();
