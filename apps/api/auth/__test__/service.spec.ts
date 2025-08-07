import { Elysia, error } from "elysia";
import jwt from "jsonwebtoken";
import { describe, test, expect, mock } from "bun:test";
import AuthService from "../service";

const app = new Elysia()
  .use(AuthService)
  .get("/", ({ Auth: { hasRole, user } }) => {
    if (!hasRole("ADMIN")) return error("Forbidden");
    return "Hello";
  });

describe("AuthService", () => {
  test("No token should return Forbidden", async () => {
    const response = await app
      .handle(new Request("http://localhost/"))
      .then((res) => res.text());

    expect(response).toBe("Forbidden");
  });

  test("Jwt with no roles should return Forbidden", async () => {
    const token = "Bearer invalidtoken";
    const mockVerify = mock(() => ({ id: 1, username: "testuser", roles: [] }));
    jwt.verify = mockVerify as any;
    const response = await app
      .handle(
        new Request("http://localhost/", { headers: { Authorization: token } }),
      )
      .then((res) => res.text());

    expect(response).toBe("Forbidden");
  });

  test("Valid jwt should return Hello", async () => {
    const mockVerify = mock(() => ({
      id: 1,
      username: "testuser",
      roles: ["ADMIN"],
    }));
    jwt.verify = mockVerify as any;
    const token =
      "Bearer " +
      jwt.sign(
        { id: "abc", roles: ["ADMIN"] },
        process.env.JWT_SECRET as string,
      );
    const response = await app
      .handle(
        new Request("http://localhost/", { headers: { authorization: token } }),
      )
      .then((res) => res.text());

    expect(response).toBe("Hello");
  });

  test("should return empty auth when token verification fails", async () => {
    const mockVerify = mock(() => {
      throw new Error("Invalid token");
    });
    jwt.verify = mockVerify as any;
    const token = "Bearer invalidtoken";
    const response = await app
      .handle(
        new Request("http://localhost/", { headers: { authorization: token } }),
      )
      .then((res) => res.text());

    expect(response).toBe("Forbidden");
    expect(mockVerify).toHaveBeenCalled();
  });
});
