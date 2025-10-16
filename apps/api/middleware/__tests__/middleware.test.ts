import { describe, it, expect, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import {
  AppError,
  requestLogger,
  requestIdMiddleware,
  createRateLimiter,
} from "../index";

describe("API Middleware", () => {
  describe("Error Handler", () => {
    it("should handle AppError correctly", async () => {
      const app = new Elysia()
        .onError(({ error, set, request }) => {
          const requestId = request.headers.get("x-request-id") || "unknown";

          if (error instanceof AppError) {
            set.status = error.statusCode;
            set.headers = {
              "Content-Type": "application/json",
            };
            return {
              error: {
                code: error.code,
                message: error.message,
                details: error.details,
                requestId,
              },
            };
          }

          set.status = 500;
          set.headers = {
            "Content-Type": "application/json",
          };
          return {
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
              requestId,
            },
          };
        })
        .get("/test", () => {
          throw new AppError("Test error", 400, "TEST_ERROR");
        });

      const response = await app.handle(new Request("http://localhost/test"));

      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error.code).toBe("TEST_ERROR");
      expect(data.error.message).toBe("Test error");
      expect(data.error.requestId).toBeDefined();
    });

    it("should handle unknown errors", async () => {
      const app = new Elysia()
        .onError(({ error, set, request }) => {
          const requestId = request.headers.get("x-request-id") || "unknown";

          if (error instanceof AppError) {
            set.status = error.statusCode;
            set.headers = {
              "Content-Type": "application/json",
            };
            return {
              error: {
                code: error.code,
                message: error.message,
                details: error.details,
                requestId,
              },
            };
          }

          set.status = 500;
          set.headers = {
            "Content-Type": "application/json",
          };
          return {
            error: {
              code: "INTERNAL_SERVER_ERROR",
              message: error.message,
              requestId,
            },
          };
        })
        .get("/test", () => {
          throw new Error("Unknown error");
        });

      const response = await app.handle(new Request("http://localhost/test"));

      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error.code).toBe("INTERNAL_SERVER_ERROR");
      expect(data.error.requestId).toBeDefined();
    });
  });

  describe("Request ID Middleware", () => {
    it("should generate request ID if not provided", async () => {
      const app = new Elysia()
        .use(requestIdMiddleware)
        .get("/test", ({ requestId }) => ({ requestId }));

      const response = await app.handle(new Request("http://localhost/test"));
      const data = await response.json();

      expect(data.requestId).toBeDefined();
      expect(response.headers.get("X-Request-ID")).toBe(data.requestId);
    });

    it("should use existing request ID if provided", async () => {
      const app = new Elysia()
        .use(requestIdMiddleware)
        .get("/test", ({ requestId }) => ({ requestId }));

      const response = await app.handle(
        new Request("http://localhost/test", {
          headers: { "X-Request-ID": "test-id-123" },
        }),
      );
      const data = await response.json();

      expect(data.requestId).toBe("test-id-123");
      expect(response.headers.get("X-Request-ID")).toBe("test-id-123");
    });
  });

  describe("Rate Limiter", () => {
    it("should allow requests within limit", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 2,
      });

      const app = new Elysia()
        .use(rateLimiter)
        .get("/test", () => ({ success: true }));

      const response1 = await app.handle(new Request("http://localhost/test"));
      const response2 = await app.handle(new Request("http://localhost/test"));

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);
      expect(response1.headers.get("X-RateLimit-Remaining")).toBe("1");
      expect(response2.headers.get("X-RateLimit-Remaining")).toBe("0");
    });

    it("should block requests exceeding limit", async () => {
      const rateLimiter = createRateLimiter({
        windowMs: 1000,
        maxRequests: 1,
      });

      const app = new Elysia()
        .use(rateLimiter)
        .get("/test", () => ({ success: true }));

      const response1 = await app.handle(new Request("http://localhost/test"));
      const response2 = await app.handle(new Request("http://localhost/test"));

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(429);
    });
  });
});
