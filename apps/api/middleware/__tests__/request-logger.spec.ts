import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { requestLogger } from "../request-logger";

describe("Request Logger", () => {
  it("should not interfere with successful requests", async () => {
    const app = new Elysia()
      .use(requestLogger)
      .get("/test", () => ({ ok: true }));

    const response = await app.handle(new Request("http://localhost/test"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("should not interfere with error responses", async () => {
    const app = new Elysia().use(requestLogger).get("/test", ({ set }) => {
      set.status = 404;
      return { error: "Not found" };
    });

    const response = await app.handle(new Request("http://localhost/test"));
    expect(response.status).toBe(404);
  });
});
