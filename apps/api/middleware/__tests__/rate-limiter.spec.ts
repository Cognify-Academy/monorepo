import { describe, it, expect, beforeEach } from "bun:test";
import { Elysia } from "elysia";
import { createRateLimiter, authRateLimiter } from "../rate-limiter";

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

  it("should include rate limit headers", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 5,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.headers.get("X-RateLimit-Limit")).toBe("5");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("4");
    expect(response.headers.get("X-RateLimit-Reset")).toBeDefined();
  });

  it("should include retry-after header when rate limited", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 60000,
      maxRequests: 1,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    await app.handle(new Request("http://localhost/test"));
    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBeDefined();
    const retryAfter = parseInt(response.headers.get("Retry-After") || "0", 10);
    expect(retryAfter).toBeGreaterThan(0);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it("should use custom key generator", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 1,
      keyGenerator: (request) => {
        return request.headers.get("user-id") || "anonymous";
      },
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    // Different users should have separate limits
    const response1 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "user-id": "user1" },
      }),
    );
    const response2 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "user-id": "user2" },
      }),
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // Same user should be rate limited
    const response3 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "user-id": "user1" },
      }),
    );

    expect(response3.status).toBe(429);
  });

  it("should reset after window expires", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 100, // 100ms window
      maxRequests: 1,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    const response1 = await app.handle(new Request("http://localhost/test"));
    expect(response1.status).toBe(200);

    const response2 = await app.handle(new Request("http://localhost/test"));
    expect(response2.status).toBe(429);

    // Wait for window to expire
    await new Promise((resolve) => setTimeout(resolve, 150));

    const response3 = await app.handle(new Request("http://localhost/test"));
    expect(response3.status).toBe(200);
  });

  it("should handle x-forwarded-for header", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 1,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    const response1 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.1" },
      }),
    );
    const response2 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-forwarded-for": "192.168.1.1, 10.0.0.2" },
      }),
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(429); // Same IP (first in x-forwarded-for)
  });

  it("should handle cf-connecting-ip header", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 1,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    const response1 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "cf-connecting-ip": "192.168.1.1" },
      }),
    );
    const response2 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "cf-connecting-ip": "192.168.1.1" },
      }),
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(429);
  });

  it("should cleanup expired entries", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 50, // 50ms window
      maxRequests: 1,
      cleanupIntervalMs: 100, // Run cleanup every 100ms
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    // Make a request to populate the store
    const response1 = await app.handle(new Request("http://localhost/test"));
    expect(response1.status).toBe(200);

    // Immediately after, we should be rate limited
    const response2 = await app.handle(new Request("http://localhost/test"));
    expect(response2.status).toBe(429);

    // Wait for cleanup to run (cleanup interval is 100ms, window is 50ms)
    await new Promise((resolve) => setTimeout(resolve, 150));

    // After cleanup, the expired entry should be removed
    const response3 = await app.handle(new Request("http://localhost/test"));
    expect(response3.status).toBe(200);
  });

  it("should handle x-real-ip header", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 1,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    const response1 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-real-ip": "192.168.1.1" },
      }),
    );
    const response2 = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-real-ip": "192.168.1.1" },
      }),
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(429);
  });

  it("should prioritize cf-connecting-ip over other headers", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 1,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }));

    // First request with cf-connecting-ip
    const response1 = await app.handle(
      new Request("http://localhost/test", {
        headers: {
          "cf-connecting-ip": "192.168.1.1",
          "x-real-ip": "10.0.0.1",
          "x-forwarded-for": "172.16.0.1",
        },
      }),
    );

    // Second request with same cf-connecting-ip but different other IPs
    const response2 = await app.handle(
      new Request("http://localhost/test", {
        headers: {
          "cf-connecting-ip": "192.168.1.1",
          "x-real-ip": "10.0.0.2",
          "x-forwarded-for": "172.16.0.2",
        },
      }),
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(429); // Should be rate limited because cf-connecting-ip is the same
  });

  it("should use authRateLimiter with custom key generator", async () => {
    const app = new Elysia()
      .use(authRateLimiter)
      .post("/auth/login", () => ({ success: true }));

    const headers = {
      "x-forwarded-for": "192.168.1.1",
      "user-agent": "Mozilla/5.0",
    };

    // Make multiple requests with same IP and user agent
    const response1 = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers,
      }),
    );
    const response2 = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers,
      }),
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200);

    // The authRateLimiter has a limit of 5 requests per 15 minutes
    // Make 3 more requests to reach the limit
    await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers,
      }),
    );
    await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers,
      }),
    );
    await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers,
      }),
    );

    // The 6th request should be rate limited
    const response6 = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers,
      }),
    );

    expect(response6.status).toBe(429);
  });

  it("should differentiate users by IP and user agent in authRateLimiter", async () => {
    const app = new Elysia()
      .use(authRateLimiter)
      .post("/auth/login", () => ({ success: true }));

    // Different user agents should have separate limits
    const response1 = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "x-forwarded-for": "10.0.0.1",
          "user-agent": "Mozilla/5.0",
        },
      }),
    );
    const response2 = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        headers: {
          "x-forwarded-for": "10.0.0.1",
          "user-agent": "Chrome/90.0",
        },
      }),
    );

    expect(response1.status).toBe(200);
    expect(response2.status).toBe(200); // Different user agent, should not be rate limited
  });

  it("should skip rate limiting for OPTIONS requests (CORS preflight)", async () => {
    const rateLimiter = createRateLimiter({
      windowMs: 1000,
      maxRequests: 1,
    });

    const app = new Elysia()
      .use(rateLimiter)
      .get("/test", () => ({ success: true }))
      .options("/test", () => ({ success: true }));

    // First regular request should consume the rate limit
    const response1 = await app.handle(new Request("http://localhost/test"));
    expect(response1.status).toBe(200);

    // Second regular request should be rate limited
    const response2 = await app.handle(new Request("http://localhost/test"));
    expect(response2.status).toBe(429);

    // OPTIONS request should not be rate limited even though we've exceeded the limit
    const response3 = await app.handle(
      new Request("http://localhost/test", { method: "OPTIONS" }),
    );
    expect(response3.status).toBe(200);
  });
});
