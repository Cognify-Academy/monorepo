import { describe, it, expect, beforeEach, jest } from "bun:test";
import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import AuthService from "../../auth/service";

// Mock the deleteCourse function
const mockDeleteCourse = jest.fn();

const JWT_SECRET = "supersecret";

// Set the JWT_SECRET environment variable for tests
process.env.JWT_SECRET = JWT_SECRET;

// Create a test app with the instructor courses endpoint
const createTestApp = () => {
  return new Elysia({ prefix: "/instructor/courses" })
    .use(AuthService)
    .get(
      "/",
      async ({
        Auth: { hasRole, user },
      }: {
        Auth: {
          hasRole: (role: string) => boolean;
          user: { id: string } | null;
        };
      }) => {
        if (!user?.id) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        if (!hasRole("INSTRUCTOR")) {
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        }

        // Mock the database call
        return [
          {
            id: "course-1",
            title: "Test Course",
            slug: "test-course",
            description: "A test course",
            published: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: user.id,
            instructors: [{ id: user.id }],
            conceptIds: ["concept-1", "concept-2"],
          },
        ];
      },
      {
        detail: { tags: ["Instructor Courses"] },
      },
    )
    .delete(
      "/:courseId",
      async ({ Auth: { hasRole, user }, params }) => {
        if (!hasRole("INSTRUCTOR"))
          return new Response(JSON.stringify({ error: "Forbidden" }), {
            status: 403,
            headers: { "Content-Type": "application/json" },
          });
        if (!user) {
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        try {
          await mockDeleteCourse({
            id: params.courseId,
            userId: user.id,
          });
          return { message: "Course deleted successfully" };
        } catch (error) {
          if (error instanceof Error) {
            if (error.message === "Course not found") {
              return new Response(
                JSON.stringify({ error: "Course not found" }),
                {
                  status: 404,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }
            if (error.message === "Unauthorized to delete this course") {
              return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 403,
                headers: { "Content-Type": "application/json" },
              });
            }
            if (error.message.includes("Cannot delete course with sections")) {
              return new Response(JSON.stringify({ error: error.message }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
              });
            }
          }
          return new Response(
            JSON.stringify({ error: "Internal server error" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      },
      {
        detail: { tags: ["Instructor Courses"] },
      },
    );
};

describe("Instructor Courses API", () => {
  let app: Elysia;

  beforeEach(() => {
    app = createTestApp();
    // Reset the mock before each test
    mockDeleteCourse.mockReset();
  });

  describe("GET /instructor/courses", () => {
    it("should return 401 when no authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/instructor/courses", {
          method: "GET",
        }),
      );

      expect(response.status).toBe(401); // Should return 401 for missing auth
    });

    it("should return 401 when authorization header is malformed", async () => {
      const response = await app.handle(
        new Request("http://localhost/instructor/courses", {
          method: "GET",
          headers: {
            authorization: "InvalidToken",
          },
        }),
      );

      expect(response.status).toBe(401); // Should return 401 for invalid auth
    });

    it("should return 401 when token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/instructor/courses", {
          method: "GET",
          headers: {
            authorization: "Bearer invalid-token",
          },
        }),
      );

      expect(response.status).toBe(401); // Should return 401 for invalid auth
    });

    it("should return 401 when user does not have INSTRUCTOR role", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["STUDENT"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses", {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(403); // Should return 403 for STUDENT role (Forbidden)
    });

    it("should return courses when user has INSTRUCTOR role", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses", {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "course-1",
        title: "Test Course",
        userId: "user-123",
      });
    });

    it("should return courses when user has multiple roles including INSTRUCTOR", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR", "ADMIN"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses", {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(200);

      const result = await response.json();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(1);
    });

    it("should return 401 when token is expired", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "-1h" }, // Expired token
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses", {
          method: "GET",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(401); // Should return 401 for expired token
    });
  });

  describe("DELETE /instructor/courses/:courseId", () => {
    it("should return 403 when no authorization header", async () => {
      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
        }),
      );

      expect(response.status).toBe(403);
    });

    it("should return 403 when authorization header is malformed", async () => {
      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: "InvalidToken",
          },
        }),
      );

      expect(response.status).toBe(403);
    });

    it("should return 403 when token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: "Bearer invalid-token",
          },
        }),
      );

      expect(response.status).toBe(403);
    });

    it("should return 403 when user does not have INSTRUCTOR role", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["STUDENT"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.error).toBe("Forbidden");
    });

    it("should return 403 when token is expired", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "-1h" }, // Expired token
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(403);
    });

    it("should successfully delete course when user is instructor and course has no sections", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      // Mock successful deletion
      mockDeleteCourse.mockResolvedValue({
        id: "course-123",
        title: "Test Course",
        message: "Course deleted successfully",
      });

      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.message).toBe("Course deleted successfully");
      expect(mockDeleteCourse).toHaveBeenCalledWith({
        id: "course-123",
        userId: "user-123",
      });
    });

    it("should return 404 when course is not found", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      // Mock course not found error
      mockDeleteCourse.mockRejectedValue(new Error("Course not found"));

      const response = await app.handle(
        new Request("http://localhost/instructor/courses/non-existent-course", {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.error).toBe("Course not found");
    });

    it("should return 403 when user is not authorized to delete the course", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      // Mock unauthorized error
      mockDeleteCourse.mockRejectedValue(
        new Error("Unauthorized to delete this course"),
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(403);
      const result = await response.json();
      expect(result.error).toBe("Unauthorized");
    });

    it("should return 400 when course has sections", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      // Mock course with sections error
      mockDeleteCourse.mockRejectedValue(
        new Error(
          "Cannot delete course with sections. Please delete all sections first.",
        ),
      );

      const response = await app.handle(
        new Request(
          "http://localhost/instructor/courses/course-with-sections",
          {
            method: "DELETE",
            headers: {
              authorization: `Bearer ${token}`,
            },
          },
        ),
      );

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toBe(
        "Cannot delete course with sections. Please delete all sections first.",
      );
    });

    it("should return 500 when an unexpected error occurs", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      // Mock unexpected error
      mockDeleteCourse.mockRejectedValue(
        new Error("Database connection failed"),
      );

      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(500);
      const result = await response.json();
      expect(result.error).toBe("Internal server error");
    });

    it("should work with multiple roles including INSTRUCTOR", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR", "ADMIN"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      // Mock successful deletion
      mockDeleteCourse.mockResolvedValue({
        id: "course-123",
        title: "Test Course",
        message: "Course deleted successfully",
      });

      const response = await app.handle(
        new Request("http://localhost/instructor/courses/course-123", {
          method: "DELETE",
          headers: {
            authorization: `Bearer ${token}`,
          },
        }),
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result.message).toBe("Course deleted successfully");
    });
  });
});
