// Bun test setup for React testing
import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { createRoot } from "react-dom/client";

// Mock DOM environment
import { GlobalWindow } from "happy-dom";

// Set up global DOM environment
const globalWindow = new GlobalWindow();
global.window = globalWindow;
global.document = globalWindow.document;
global.navigator = globalWindow.navigator;

// Make sure document is available globally
if (typeof global.document === "undefined") {
  global.document = globalWindow.document;
}

// Ensure window is available
if (typeof global.window === "undefined") {
  global.window = globalWindow;
}

// Clean up DOM after each test
afterEach(() => {
  if (global.document && global.document.body) {
    global.document.body.innerHTML = "";
  }
});

// Mock Next.js router
global.mock = (module: string, factory: () => any) => {
  // Simple module mocking for Bun
  return factory();
};

// Mock Next.js router
global.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: {},
      asPath: "/",
      push: global.fn(),
      replace: global.fn(),
      reload: global.fn(),
      back: global.fn(),
      prefetch: global.fn(),
      beforePopState: global.fn(),
      events: {
        on: global.fn(),
        off: global.fn(),
        emit: global.fn(),
      },
      isFallback: false,
      isLocaleDomain: false,
      isReady: true,
      isPreview: false,
    };
  },
}));

// Mock Next.js navigation
global.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: global.fn(),
      replace: global.fn(),
      prefetch: global.fn(),
      back: global.fn(),
      forward: global.fn(),
      refresh: global.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return "/";
  },
  useParams() {
    return {};
  },
}));

// Mock function helper
if (typeof global.fn === "undefined") {
  global.fn = () => {
    const calls: any[] = [];
    const mockFn = (...args: any[]) => {
      calls.push(args);
      if (mockFn._resolvedValue !== undefined) {
        return Promise.resolve(mockFn._resolvedValue);
      }
      if (mockFn._rejectedValue !== undefined) {
        return Promise.reject(mockFn._rejectedValue);
      }
      if (mockFn._impl) {
        return mockFn._impl(...args);
      }
      return mockFn;
    };
    mockFn.calls = calls;
    mockFn.mockImplementation = (impl: any) => {
      mockFn._impl = impl;
      return mockFn;
    };
    mockFn.mockRejectedValueOnce = (value: any) => {
      mockFn._rejectedValue = value;
      return mockFn;
    };
    mockFn.mockResolvedValueOnce = (value: any) => {
      mockFn._resolvedValue = value;
      return mockFn;
    };
    mockFn.mockResolvedValue = (value: any) => {
      mockFn._resolvedValue = value;
      return mockFn;
    };
    mockFn.toHaveBeenCalledTimes = (times: number) => {
      return calls.length === times;
    };
    mockFn.toHaveBeenCalled = () => {
      return calls.length > 0;
    };
    mockFn.not = {
      toHaveBeenCalled: () => {
        return calls.length === 0;
      },
    };
    return mockFn;
  };
}

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
process.env.NODE_ENV = "test";

// Mock fetch globally
global.fetch = global.fn();

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor(callback: any, options?: any) {
    // Mock implementation
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback: any) {
    // Mock implementation
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
if (typeof window !== "undefined") {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: global.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: global.fn(),
      removeListener: global.fn(),
      addEventListener: global.fn(),
      removeEventListener: global.fn(),
      dispatchEvent: global.fn(),
    })),
  });

  // Mock scrollTo
  Object.defineProperty(window, "scrollTo", {
    value: global.fn(),
    writable: true,
  });
}
