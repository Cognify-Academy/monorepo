// Vitest configuration and utilities
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import "./types";

export const vitestConfig = defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test-setup.ts"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test-setup.ts",
        "**/*.d.ts",
        "**/*.config.*",
        "**/coverage/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../../apps/cognify-ui/src"),
      "@test-utils": path.resolve(__dirname, "../test-utils/src"),
    },
  },
});

// Vitest test utilities
export const setupVitest = () => {
  // Global test setup for Vitest
  if (typeof beforeAll !== "undefined") {
    beforeAll(() => {
      // Setup global mocks or configurations
    });

    afterAll(() => {
      // Cleanup after all tests
    });

    beforeEach(() => {
      // Setup before each test
    });

    afterEach(() => {
      // Cleanup after each test
    });
  }
};

// Custom matchers for Vitest
export const customMatchers = {
  toBeInTheDocument: (received: any) => {
    const pass =
      received &&
      received.ownerDocument &&
      received.ownerDocument.contains(received);
    return {
      pass,
      message: () =>
        `Expected element ${pass ? "not " : ""}to be in the document`,
    };
  },
};
