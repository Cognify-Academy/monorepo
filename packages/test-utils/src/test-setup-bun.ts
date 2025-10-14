// Global test setup for Bun test runner
import "@testing-library/jest-dom";
import "./types";

// Mock Next.js router
global.mock = (module: string, factory: () => any) => {
  // Bun's mocking system
  if (typeof Bun !== "undefined") {
    // @ts-ignore
    Bun.mock(module, factory);
  }
};

// Mock function helper
global.fn = () => {
  const calls: any[] = [];
  const mockFn = (...args: any[]) => {
    calls.push(args);
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

// Mock environment variables
process.env.NEXT_PUBLIC_API_URL = "http://localhost:3001";
process.env.NODE_ENV = "test";

// Mock fetch globally
global.fetch = global.fn();

// Mock IntersectionObserver
global.IntersectionObserver = global.fn().mockImplementation(() => ({
  observe: global.fn(),
  unobserve: global.fn(),
  disconnect: global.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = global.fn().mockImplementation(() => ({
  observe: global.fn(),
  unobserve: global.fn(),
  disconnect: global.fn(),
}));

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

// Setup cleanup after each test
global.afterEach = (fn: () => void) => {
  // Bun's afterEach
  if (typeof afterEach !== "undefined") {
    afterEach(fn);
  }
};

// Force cleanup on process exit
if (typeof process !== "undefined") {
  process.on("exit", () => {
    // Cleanup
  });
}
