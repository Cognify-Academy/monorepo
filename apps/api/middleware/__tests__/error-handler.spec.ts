import { describe, it, expect } from "bun:test";
import { Elysia } from "elysia";
import { AppError, errorHandler, createErrorHandler } from "../error-handler";

describe("Error Handler", () => {
  it("should handle AppError correctly", async () => {
    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw new AppError("Test error", 400, "TEST_ERROR");
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error.code).toBe("TEST_ERROR");
    expect(data.error.message).toBe("Test error");
    expect(data.error.requestId).toBeDefined();
  });

  it("should handle AppError with details", async () => {
    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw new AppError("Validation failed", 422, "VALIDATION_ERROR", {
        field: "email",
        issue: "invalid format",
      });
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(422);

    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Validation failed");
    expect(data.error.details).toEqual({
      field: "email",
      issue: "invalid format",
    });
    expect(data.error.requestId).toBeDefined();
  });

  it("should handle unknown errors", async () => {
    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw new Error("Unknown error");
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(data.error.requestId).toBeDefined();
  });

  it("should use default values when no parameters provided", () => {
    const error = new AppError("Something went wrong");

    expect(error.message).toBe("Something went wrong");
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe("INTERNAL_ERROR");
    expect(error.details).toBeUndefined();
    expect(error.name).toBe("AppError");
  });

  it("should handle custom request ID", async () => {
    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw new AppError("Test error", 400, "TEST_ERROR");
    });

    const response = await app.handle(
      new Request("http://localhost/test", {
        headers: { "x-request-id": "custom-request-id-123" },
      }),
    );

    expect(response.status).toBe(400);

    const data = await response.json();
    expect(data.error.requestId).toBe("custom-request-id-123");
  });

  it("should handle ZodError", async () => {
    const zodError = new Error("Zod validation failed");
    zodError.name = "ZodError";
    (zodError as any).issues = [{ path: ["email"], message: "Invalid email" }];

    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw zodError;
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Invalid request data");
    expect(data.error.details).toBeDefined();
  });

  it("should handle PrismaClientKnownRequestError", async () => {
    const prismaError = new Error("Unique constraint violation");
    prismaError.name = "PrismaClientKnownRequestError";

    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw prismaError;
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("DATABASE_ERROR");
    expect(data.error.message).toBe("Database operation failed");
  });

  it("should handle PrismaClientValidationError", async () => {
    const prismaError = new Error("Invalid data");
    prismaError.name = "PrismaClientValidationError";

    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw prismaError;
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Invalid data provided");
  });

  it("should handle JsonWebTokenError", async () => {
    const jwtError = new Error("Invalid token");
    jwtError.name = "JsonWebTokenError";

    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw jwtError;
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe("INVALID_TOKEN");
    expect(data.error.message).toBe("Invalid authentication token");
  });

  it("should handle TokenExpiredError", async () => {
    const jwtError = new Error("Token expired");
    jwtError.name = "TokenExpiredError";

    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw jwtError;
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe("TOKEN_EXPIRED");
    expect(data.error.message).toBe("Authentication token has expired");
  });

  it("should handle rate limit errors", async () => {
    const rateLimitError = new Error("rate limit exceeded");

    const app = new Elysia().use(errorHandler).get("/test", () => {
      throw rateLimitError;
    });

    const response = await app.handle(new Request("http://localhost/test"));

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(data.error.message).toBe(
      "Too many requests, please try again later",
    );
  });
});

describe("createErrorHandler", () => {
  it("should handle AppError correctly", async () => {
    const handler = createErrorHandler();
    const error = new AppError("Test error", 400, "TEST_ERROR");
    const request = new Request("http://localhost/test");

    const response = handler(error, request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("TEST_ERROR");
    expect(data.error.message).toBe("Test error");
    expect(data.error.requestId).toBeDefined();
  });

  it("should handle AppError with details", async () => {
    const handler = createErrorHandler();
    const error = new AppError("Validation failed", 422, "VALIDATION_ERROR", {
      field: "email",
      issue: "invalid format",
    });
    const request = new Request("http://localhost/test");

    const response = handler(error, request);

    expect(response.status).toBe(422);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Validation failed");
    expect(data.error.details).toEqual({
      field: "email",
      issue: "invalid format",
    });
    expect(data.error.requestId).toBeDefined();
  });

  it("should handle custom request ID", async () => {
    const handler = createErrorHandler();
    const error = new AppError("Test error", 400, "TEST_ERROR");
    const request = new Request("http://localhost/test", {
      headers: { "x-request-id": "custom-request-id-123" },
    });

    const response = handler(error, request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.requestId).toBe("custom-request-id-123");
  });

  it("should handle ZodError", async () => {
    const handler = createErrorHandler();
    const zodError = new Error("Zod validation failed");
    zodError.name = "ZodError";
    (zodError as any).issues = [{ path: ["email"], message: "Invalid email" }];
    const request = new Request("http://localhost/test");

    const response = handler(zodError, request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Invalid request data");
    expect(data.error.details).toBeDefined();
  });

  it("should handle PrismaClientKnownRequestError", async () => {
    const handler = createErrorHandler();
    const prismaError = new Error("Unique constraint violation");
    prismaError.name = "PrismaClientKnownRequestError";
    const request = new Request("http://localhost/test");

    const response = handler(prismaError, request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("DATABASE_ERROR");
    expect(data.error.message).toBe("Database operation failed");
  });

  it("should handle PrismaClientValidationError", async () => {
    const handler = createErrorHandler();
    const prismaError = new Error("Invalid data");
    prismaError.name = "PrismaClientValidationError";
    const request = new Request("http://localhost/test");

    const response = handler(prismaError, request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error.code).toBe("VALIDATION_ERROR");
    expect(data.error.message).toBe("Invalid data provided");
  });

  it("should handle JsonWebTokenError", async () => {
    const handler = createErrorHandler();
    const jwtError = new Error("Invalid token");
    jwtError.name = "JsonWebTokenError";
    const request = new Request("http://localhost/test");

    const response = handler(jwtError, request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe("INVALID_TOKEN");
    expect(data.error.message).toBe("Invalid authentication token");
  });

  it("should handle TokenExpiredError", async () => {
    const handler = createErrorHandler();
    const jwtError = new Error("Token expired");
    jwtError.name = "TokenExpiredError";
    const request = new Request("http://localhost/test");

    const response = handler(jwtError, request);

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.error.code).toBe("TOKEN_EXPIRED");
    expect(data.error.message).toBe("Authentication token has expired");
  });

  it("should handle rate limit errors", async () => {
    const handler = createErrorHandler();
    const rateLimitError = new Error("rate limit exceeded");
    const request = new Request("http://localhost/test");

    const response = handler(rateLimitError, request);

    expect(response.status).toBe(429);
    const data = await response.json();
    expect(data.error.code).toBe("RATE_LIMIT_EXCEEDED");
    expect(data.error.message).toBe(
      "Too many requests, please try again later",
    );
  });

  it("should handle unknown errors", async () => {
    const handler = createErrorHandler();
    const unknownError = new Error("Unknown error");
    const request = new Request("http://localhost/test");

    const response = handler(unknownError, request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.code).toBe("INTERNAL_SERVER_ERROR");
    expect(data.error.requestId).toBeDefined();
  });

  it("should hide error message in production", async () => {
    const handler = createErrorHandler();
    const unknownError = new Error("Sensitive error message");
    const request = new Request("http://localhost/test");
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const response = handler(unknownError, request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.message).toBe("An internal server error occurred");
    expect(data.error.message).not.toBe("Sensitive error message");

    process.env.NODE_ENV = originalEnv;
  });

  it("should show error message in development", async () => {
    const handler = createErrorHandler();
    const unknownError = new Error("Detailed error message");
    const request = new Request("http://localhost/test");
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const response = handler(unknownError, request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error.message).toBe("Detailed error message");

    process.env.NODE_ENV = originalEnv;
  });
});
