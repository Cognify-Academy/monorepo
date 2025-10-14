import { CourseCard } from "@/components/course-card";
import { AuthProvider } from "@/contexts/auth";
import { render, screen } from "@testing-library/react";
import { createMockCourse } from "../../mocks/test-utils";

// Mock the API module
global.mock("@/lib/api", () => ({
  apiClient: {
    refresh: global.fn().mockResolvedValue({ token: "mock-token" }),
    login: global.fn().mockResolvedValue({ token: "mock-token" }),
    logout: global.fn().mockResolvedValue({ message: "Logged out" }),
  },
  ApiError: class ApiError extends Error {
    constructor(
      message: string,
      public status: number,
    ) {
      super(message);
    }
  },
}));

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
