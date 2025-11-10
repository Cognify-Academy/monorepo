/**
 * Integration helper to connect API client with auth context
 * Call this in your app initialization
 */

import { apiClient } from "./api-client";
import type { TokenProvider, TokenRefresher, OnAuthError } from "./api-client";

export function setupApiClient(
  tokenProvider: TokenProvider,
  tokenRefresher: TokenRefresher,
  onAuthError: OnAuthError,
) {
  apiClient.setTokenProvider(tokenProvider);
  apiClient.setTokenRefresher(tokenRefresher);
  apiClient.setOnAuthError(onAuthError);
}

