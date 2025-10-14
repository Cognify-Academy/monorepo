import { describe, it, expect, beforeEach } from "bun:test";
import jwt from "jsonwebtoken";
import { Elysia } from "elysia";
import AuthService from "../service";

// We need to test the AuthService, but it's an Elysia instance
// Let's create a testable version of the auth logic
const JWT_SECRET = "test-secret-key";

// Set the JWT_SECRET environment variable for tests
process.env.JWT_SECRET = JWT_SECRET;

function createTestApp() {
  // Create a test app that uses the actual AuthService
  return new Elysia()
    .use(AuthService)
    .get("/test", ({ Auth: { hasRole, user } }) => {
      return {
        user,
        hasRole: hasRole("INSTRUCTOR"),
        hasAdminRole: hasRole("ADMIN"),
        hasStudentRole: hasRole("STUDENT"),
      };
    });
}

describe("AuthService", () => {
  let app: Elysia;

  beforeEach(() => {
    app = createTestApp();
  });

  describe("token validation", () => {
    it("should return null user when no authorization header", async () => {
      const response = await app.handle(new Request("http://localhost/test"));
      const result = await response.json();

      expect(result.user).toBeNull();
      expect(result.hasRole).toBe(false);
    });

    it("should return null user when authorization header is malformed", async () => {
      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: "InvalidToken" },
        }),
      );
      const result = await response.json();

      expect(result.user).toBeNull();
      expect(result.hasRole).toBe(false);
    });

    it("should return null user when token is invalid", async () => {
      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: "Bearer invalid-token" },
        }),
      );
      const result = await response.json();

      expect(result.user).toBeNull();
      expect(result.hasRole).toBe(false);
    });

    it("should return user when token is valid", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const result = await response.json();

      expect(result.user).toMatchObject({
        id: "user-123",
        roles: ["INSTRUCTOR"],
      });
      expect(result.hasRole).toBe(true);
      expect(result.hasStudentRole).toBe(false);
    });

    it("should return null user when token is expired", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "-1h" }, // Expired token
      );

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const result = await response.json();

      expect(result.user).toBeNull();
      expect(result.hasRole).toBe(false);
    });

    it("should handle multiple roles correctly", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR", "ADMIN"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const result = await response.json();

      expect(result.user).toMatchObject({
        id: "user-123",
        roles: ["INSTRUCTOR", "ADMIN"],
      });
      expect(result.hasRole).toBe(true);
      expect(result.hasAdminRole).toBe(true);
      expect(result.hasStudentRole).toBe(false);
    });
  });

  describe("hasRole function", () => {
    it("should return true when user has the required role", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const result = await response.json();

      expect(result.hasRole).toBe(true);
    });

    it("should return false when user does not have the required role", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["STUDENT"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const result = await response.json();

      expect(result.hasRole).toBe(false);
    });

    it("should return true when user has any of the required roles", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["INSTRUCTOR"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const result = await response.json();

      expect(result.hasRole).toBe(true);
    });

    it("should return false when user has none of the required roles", async () => {
      const token = jwt.sign(
        { id: "user-123", roles: ["STUDENT"] },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { authorization: `Bearer ${token}` },
        }),
      );
      const result = await response.json();

      expect(result.hasRole).toBe(false);
    });
  });
});
