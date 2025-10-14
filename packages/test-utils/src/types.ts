// Type declarations for test utilities

declare global {
  var window: Window & typeof globalThis;
  var afterEach: (fn: () => void) => void;
  var beforeAll: (fn: () => void) => void;
  var afterAll: (fn: () => void) => void;
  var beforeEach: (fn: () => void) => void;
}

export {};
