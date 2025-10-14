import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import { Elysia } from "elysia";
import jwt from "jsonwebtoken";
import prisma from "../../prisma";
import AuthService from "../../auth/service";

const JWT_SECRET = "supersecret";

// Set the JWT_SECRET environment variable for tests
process.env.JWT_SECRET = JWT_SECRET;

// Create a test app with the instructor courses endpoint
const createTestApp = () => {
  return new Elysia({ prefix: "/instructor/courses" }).use(AuthService).get(
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
  );
};

describe("Instructor Courses API", () => {
  let app: Elysia;

  beforeEach(() => {
    app = createTestApp();
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
});
