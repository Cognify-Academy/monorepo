// Common test utilities and helpers
import type { ReactElement } from "react";

// Mock data factories
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: "testuser",
  email: "test@example.com",
  name: "Test User",
  roles: [{ role: "STUDENT" }],
  ...overrides,
});

export const createMockCourse = (overrides = {}) => ({
  id: 1,
  title: "Test Course",
  description: "A test course description",
  slug: "test-course",
  instructorId: 1,
  isPublished: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockLesson = (overrides = {}) => ({
  id: 1,
  title: "Test Lesson",
  content: "Test lesson content",
  courseId: 1,
  order: 1,
  duration: 30,
  isPublished: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

export const createMockConcept = (overrides = {}) => ({
  id: 1,
  title: "Test Concept",
  description: "A test concept description",
  slug: "test-concept",
  importance: 5,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
  ...overrides,
});

// Test helpers
export const waitForNextTick = () =>
  new Promise((resolve) => setTimeout(resolve, 0));

export const createMockRequest = (overrides = {}) => ({
  method: "GET",
  url: "http://localhost:3000",
  headers: new Headers(),
  ...overrides,
});

export const createMockResponse = (overrides = {}) => ({
  status: 200,
  headers: new Headers(),
  json: () => Promise.resolve({}),
  ...overrides,
});

// Component test helpers
export const createWrapper = (
  Wrapper: React.ComponentType<{ children: React.ReactNode }>,
) => {
  return ({ children }: { children: React.ReactNode }) => {
    const React = require("react");
    return React.createElement(Wrapper, {}, children);
  };
};

// API test helpers
export const mockApiResponse = <T>(data: T, status = 200) => ({
  status,
  json: () => Promise.resolve(data),
  ok: status >= 200 && status < 300,
});

export const mockApiError = (message = "API Error", status = 500) => ({
  status,
  json: () => Promise.resolve({ error: message }),
  ok: false,
});

// Database test helpers
export const createMockPrismaClient = () => {
  const { vi } = require("vitest");
  return {
    user: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    course: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    lesson: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    concept: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  };
};
