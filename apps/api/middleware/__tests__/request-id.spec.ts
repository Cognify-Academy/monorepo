import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { requestIdMiddleware, getRequestId } from "../request-id";

describe("Request ID Middleware", () => {
  it("should generate request ID if not provided", async () => {
    const app = new Elysia()
      .use(requestIdMiddleware)
      .get("/test", (context: any) => ({ requestId: context.requestId }));

    const response = await app.handle(new Request("http://localhost/test"));
    const data = await response.json();

    expect(data.requestId).toBeDefined();
    expect(typeof data.requestId).toBe("string");
    expect(data.requestId.length).toBeGreaterThan(0);
    expect(response.headers.get("X-Request-ID")).toBe(data.requestId);
  });

  it("should use existing request ID if provided", async () => {
    const app = new Elysia()
      .use(requestIdMiddleware)
      .get("/test", (context: any) => ({ requestId: context.requestId }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { "X-Request-ID": "test-id-123" },
      }),
    );
    const data = await response.json();

    expect(data.requestId).toBe("test-id-123");
    expect(response.headers.get("X-Request-ID")).toBe("test-id-123");
  });

  it("should use existing request ID with lowercase header", async () => {
    const app = new Elysia()
      .use(requestIdMiddleware)
      .get("/test", (context: any) => ({ requestId: context.requestId }));

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-request-id": "lowercase-id-456" },
      }),
    );
    const data = await response.json();

    expect(data.requestId).toBe("lowercase-id-456");
    expect(response.headers.get("X-Request-ID")).toBe("lowercase-id-456");
  });

  it("should generate unique request IDs", async () => {
    const app = new Elysia()
      .use(requestIdMiddleware)
      .get("/test", (context: any) => ({ requestId: context.requestId }));

    const response1 = await app.handle(new Request("http://localhost/test"));
    const response2 = await app.handle(new Request("http://localhost/test"));

    const data1 = await response1.json();
    const data2 = await response2.json();

    expect(data1.requestId).toBeDefined();
    expect(data2.requestId).toBeDefined();
    expect(data1.requestId).not.toBe(data2.requestId);
  });

  it("should include request ID in response headers", async () => {
    const app = new Elysia()
      .use(requestIdMiddleware)
      .get("/test", () => ({ message: "ok" }));

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.headers.get("X-Request-ID")).toBeDefined();
    expect(typeof response.headers.get("X-Request-ID")).toBe("string");
  });

  it("should make request ID available in context", async () => {
    const app = new Elysia()
      .use(requestIdMiddleware)
      .get("/test", (context) => {
        const requestId = getRequestId(context);
        return { requestId };
      });

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { "X-Request-ID": "context-test-789" },
      }),
    );
    const data = await response.json();

    expect(data.requestId).toBe("context-test-789");
  });

  it("should return 'unknown' for missing request ID in getRequestId", () => {
    const result = getRequestId({});
    expect(result).toBe("unknown");
  });

  it("should generate request ID with timestamp and random components", async () => {
    const app = new Elysia()
      .use(requestIdMiddleware)
      .get("/test", (context: any) => ({ requestId: context.requestId }));

    const response = await app.handle(new Request("http://localhost/test"));
    const data = await response.json();

    // Request ID should contain a hyphen (format: timestamp-random)
    expect(data.requestId).toContain("-");
    const parts = data.requestId.split("-");
    expect(parts.length).toBe(2);
    expect(parts[0].length).toBeGreaterThan(0);
    expect(parts[1].length).toBeGreaterThan(0);
  });
});
