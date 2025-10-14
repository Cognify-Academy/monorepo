// Simple mock for test-utils to avoid module resolution issues
export const createMockCourse = (overrides: any = {}) => ({
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
  ...overrides,
});

export const createMockUser = (overrides: any = {}) => ({
  id: "test-user-id",
  name: "Test User",
  username: "testuser",
  email: "test@example.com",
  roles: ["STUDENT"],
  ...overrides,
});
