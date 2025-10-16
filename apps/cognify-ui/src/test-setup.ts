/* eslint-disable react/display-name */
// Bun test setup for React testing
import "@testing-library/jest-dom";
import React from "react";
import { afterEach } from "vitest";

// Mock DOM environment
import { GlobalWindow } from "happy-dom";

// Set up global DOM environment
const globalWindow = new GlobalWindow();
(global as any).window = globalWindow;
(global as any).document = globalWindow.document;
(global as any).navigator = globalWindow.navigator;

// Make sure document is available globally
if (typeof (global as any).document === "undefined") {
  (global as any).document = globalWindow.document;
}

// Ensure window is available
if (typeof (global as any).window === "undefined") {
  (global as any).window = globalWindow;
}

// Clean up DOM after each test
afterEach(() => {
  if ((global as any).document && (global as any).document.body) {
    (global as any).document.body.innerHTML = "";
  }
});

// Mock Next.js router
(global as any).mock = (module: string, factory: () => any) => {
  // Simple module mocking for Bun
  return factory();
};

// Mock functions for testing
(global as any).fn = (implementation?: any) => {
  const calls: any[] = [];
  const mockFn = (...args: any[]) => {
    calls.push(args);
    if (implementation) {
      return implementation(...args);
    }
    return undefined;
  };

  mockFn.calls = calls;
  mockFn.mockResolvedValue = (value: any) => {
    mockFn._resolvedValue = value;
    return mockFn;
  };
  mockFn.mockRejectedValue = (value: any) => {
    mockFn._rejectedValue = value;
    return mockFn;
  };
  mockFn.mockImplementation = (impl: any) => {
    mockFn._implementation = impl;
    return mockFn;
  };
  mockFn.toHaveBeenCalled = () => calls.length > 0;
  mockFn.toHaveBeenCalledTimes = (times: number) => calls.length === times;
  mockFn.toHaveBeenCalledWith = (...args: any[]) => {
    return calls.some(
      (call) =>
        call.length === args.length &&
        call.every((arg, index) => arg === args[index]),
    );
  };

  // Add 'not' property for negative assertions
  mockFn.not = {
    toHaveBeenCalled: () => calls.length === 0,
    toHaveBeenCalledTimes: (times: number) => calls.length !== times,
    toHaveBeenCalledWith: (...args: any[]) => {
      return !calls.some(
        (call) =>
          call.length === args.length &&
          call.every((arg, index) => arg === args[index]),
      );
    },
  };

  return mockFn;
};

// Mock Next.js navigation
(global as any).useRouter = () => ({
  push: () => {},
  replace: () => {},
  prefetch: () => {},
  back: () => {},
  forward: () => {},
  refresh: () => {},
});

// Mock Next.js usePathname
(global as any).usePathname = () => "/";

// Mock Next.js useSearchParams
(global as any).useSearchParams = () => new URLSearchParams();

// Mock Next.js Link component
(global as any).Link = ({ children, href, ...props }: any) => {
  return React.createElement("a", { href, ...props }, children);
};

// Mock Next.js Image component
(global as any).Image = ({ src, alt, ...props }: any) => {
  return React.createElement("img", { src, alt, ...props });
};

// Mock Next.js Head component
(global as any).Head = ({ children }: any) => {
  return React.createElement("head", {}, children);
};

// Mock Next.js Script component
(global as any).Script = ({ children, ...props }: any) => {
  return React.createElement("script", props, children);
};

// Mock Next.js dynamic imports
(global as any).dynamic = (importFunc: any) => {
  return importFunc;
};

// Mock Next.js getServerSideProps
(global as any).getServerSideProps = () => ({});

// Mock Next.js getStaticProps
(global as any).getStaticProps = () => ({});

// Mock Next.js getStaticPaths
(global as any).getStaticPaths = () => ({});

// Mock Next.js API routes
(global as any).default = (req: any, res: any) => {
  res.status(200).json({});
};

// Mock fetch for API calls
(global as any).fetch = async (_url: string, _options?: any) => {
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    text: async () => "",
  };
};

// Mock localStorage
(global as any).localStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

// Mock sessionStorage
(global as any).sessionStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
};

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock ResizeObserver
(global as any).ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia
(global as any).matchMedia = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => {},
});

// Mock requestAnimationFrame
(global as any).requestAnimationFrame = (callback: any) => {
  return setTimeout(callback, 0);
};

// Mock cancelAnimationFrame
(global as any).cancelAnimationFrame = (id: any) => {
  clearTimeout(id);
};

// Mock console methods for cleaner test output
const originalConsole = console;
(global as any).console = {
  ...originalConsole,
  log: () => {},
  warn: () => {},
  error: () => {},
  info: () => {},
  debug: () => {},
};
