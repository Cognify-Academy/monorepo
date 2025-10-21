import { describe, expect, test } from "bun:test";
import { importances, importancesRouter } from "../importances";

describe("importancesRouter", () => {
  test("should return the correct importances", async () => {
    const response = await importancesRouter.handle(
      new Request("http://localhost/importances"),
    );

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toBeDefined();
    expect(data).toEqual(importances);
  });
});
