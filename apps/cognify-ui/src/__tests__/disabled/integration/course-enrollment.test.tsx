import { render, screen } from "@testing-library/react";
import { describe, it, expect, beforeEach, mock } from "bun:test";

// ---- Mock Next.js navigation (must be before any imports that use it) ----
mock.module("next/navigation", () => {
  const mockPush = () => {};
  const mockReplace = () => {};
  const mockPrefetch = () => {};
  const mockBack = () => {};
  const mockForward = () => {};
  const mockRefresh = () => {};

  return {
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      prefetch: mockPrefetch,
      back: mockBack,
      forward: mockForward,
      refresh: mockRefresh,
    }),
    usePathname: () => "/",
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
  };
});

// Mock the API module
const mockPost = mock(() => Promise.resolve({ token: null }));
const mockGet = mock(() => Promise.resolve(null));

mock.module("@/lib/api-client", () => {
  class ApiError extends Error {
    status?: number;
    constructor(message: string, status?: number) {
      super(message);
      this.name = "ApiError";
      this.status = status;
    }
  }

  class ApiClient {
    post = mockPost;
    get = mockGet;
    put = mock(() => Promise.resolve(null));
    patch = mock(() => Promise.resolve(null));
    delete = mock(() => Promise.resolve(null));
    setTokenProvider = mock(() => {});
    setTokenRefresher = mock(() => {});
    setOnAuthError = mock(() => {});
  }

  const apiClient = new ApiClient();
  return { apiClient, ApiError };
});

import { CourseCard } from "@/components/course-card";
import { AuthProvider } from "@/contexts/auth";
import { createMockCourse } from "../../mocks/test-utils";

describe("Course Enrollment Integration", () => {
  const mockCourse = createMockCourse({
    id: "test-course-id",
    title: "Test Course",
    description: "A test course description",
    slug: "test-course",
    published: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    userId: "instructor-id",
    instructors: [{ id: "instructor-id" }],
    conceptIds: ["concept-1"],
  });

  const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  beforeEach(() => {
    // Clear mocks
  });

  it("renders course card with course information", () => {
    render(
      <TestWrapper>
        <CourseCard course={mockCourse} />
      </TestWrapper>,
    );

    expect(screen.getByText("Test Course")).toBeInTheDocument();
    expect(screen.getByText("A test course description")).toBeInTheDocument();
    expect(screen.getByText("View Course →")).toBeInTheDocument();
  });

  it("displays course link with correct href", () => {
    render(
      <TestWrapper>
        <CourseCard course={mockCourse} />
      </TestWrapper>,
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/courses/test-course");
  });

  it("shows published status", () => {
    render(
      <TestWrapper>
        <CourseCard course={mockCourse} />
      </TestWrapper>,
    );

    expect(screen.getByText("Published")).toBeInTheDocument();
  });
});
