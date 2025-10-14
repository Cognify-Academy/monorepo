import { CourseCard } from "@/components/course-card";
import { render, screen } from "@testing-library/react";
import { createMockCourse } from "../mocks/test-utils";

describe("CourseCard Component", () => {
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

  it("renders course information", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Test Course")).toBeInTheDocument();
    expect(screen.getByText("A test course description")).toBeInTheDocument();
  });

  it("renders course link with correct href", () => {
    render(<CourseCard course={mockCourse} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/courses/test-course");
  });

  it("displays instructor count", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("1 instructor")).toBeInTheDocument();
  });

  it("displays published status", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("Published")).toBeInTheDocument();
  });

  it("displays view course link", () => {
    render(<CourseCard course={mockCourse} />);

    expect(screen.getByText("View Course →")).toBeInTheDocument();
  });

  it("displays creation date", () => {
    render(<CourseCard course={mockCourse} />);

    // The date should be formatted and displayed
    expect(screen.getByText(/1\/1\/2024/)).toBeInTheDocument();
  });
});
