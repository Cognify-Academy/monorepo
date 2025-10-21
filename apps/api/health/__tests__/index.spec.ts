import { healthCheck } from "../index";
import { describe, it, expect } from "bun:test";

describe("healthCheck", () => {
  it("should return a healthy response", () => {
    const result = healthCheck();
    expect(result.status).toBe("healthy");
  });
});
