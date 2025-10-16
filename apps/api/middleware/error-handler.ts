import { Elysia } from "elysia";

export interface ApiError extends Error {
  statusCode?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements ApiError {
  public statusCode: number;
  public code: string;
  public details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = "INTERNAL_ERROR",
    details?: any,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = "AppError";
  }
}

export const errorHandler = new Elysia({ name: "error-handler" }).onError(
  ({ error, set, request }) => {
    const requestId = request.headers.get("x-request-id") || "unknown";

    // Type guard to check if error is an Error instance
    const isError = (err: any): err is Error => {
      return err && typeof err === "object" && "message" in err;
    };

    // Log error details
    console.error(`[${requestId}] Error occurred:`, {
      message: isError(error) ? error.message : String(error),
      stack: isError(error) ? error.stack : undefined,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    // Handle different error types
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

    // Handle validation errors (Zod)
    if (isError(error) && error.name === "ZodError") {
      set.status = 400;
      set.headers = {
        "Content-Type": "application/json",
      };
      return {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid request data",
          details: (error as any).issues,
          requestId,
        },
      };
    }

    // Handle Prisma errors
    if (isError(error) && error.name === "PrismaClientKnownRequestError") {
      set.status = 400;
      set.headers = {
        "Content-Type": "application/json",
      };
      return {
        error: {
          code: "DATABASE_ERROR",
          message: "Database operation failed",
          requestId,
        },
      };
    }

    // Handle Prisma validation errors
    if (isError(error) && error.name === "PrismaClientValidationError") {
      set.status = 400;
      set.headers = {
        "Content-Type": "application/json",
      };
      return {
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid data provided",
          requestId,
        },
      };
    }

    // Handle JWT errors
    if (isError(error) && error.name === "JsonWebTokenError") {
      set.status = 401;
      set.headers = {
        "Content-Type": "application/json",
      };
      return {
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid authentication token",
          requestId,
        },
      };
    }

    if (isError(error) && error.name === "TokenExpiredError") {
      set.status = 401;
      set.headers = {
        "Content-Type": "application/json",
      };
      return {
        error: {
          code: "TOKEN_EXPIRED",
          message: "Authentication token has expired",
          requestId,
        },
      };
    }

    // Handle rate limit errors
    if (isError(error) && error.message.includes("rate limit")) {
      set.status = 429;
      set.headers = {
        "Content-Type": "application/json",
      };
      return {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests, please try again later",
          requestId,
        },
      };
    }

    // Default error response
    set.status = 500;
    set.headers = {
      "Content-Type": "application/json",
    };
    return {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message:
          process.env.NODE_ENV === "production"
            ? "An internal server error occurred"
            : isError(error)
              ? error.message
              : String(error),
        requestId,
      },
    };
  },
);

// Alternative error handler that can be used as a wrapper
export const createErrorHandler = () => {
  return (error: any, request: Request) => {
    const requestId = request.headers.get("x-request-id") || "unknown";

    // Log error details
    console.error(`[${requestId}] Error occurred:`, {
      message: error.message,
      stack: error.stack,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });

    // Handle different error types
    if (error instanceof AppError) {
      return new Response(
        JSON.stringify({
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
            requestId,
          },
        }),
        {
          status: error.statusCode,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Handle validation errors (Zod)
    if (error.name === "ZodError") {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.issues,
            requestId,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Handle Prisma errors
    if (error.name === "PrismaClientKnownRequestError") {
      return new Response(
        JSON.stringify({
          error: {
            code: "DATABASE_ERROR",
            message: "Database operation failed",
            requestId,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Handle Prisma validation errors
    if (error.name === "PrismaClientValidationError") {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid data provided",
            requestId,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Handle JWT errors
    if (error.name === "JsonWebTokenError") {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_TOKEN",
            message: "Invalid authentication token",
            requestId,
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (error.name === "TokenExpiredError") {
      return new Response(
        JSON.stringify({
          error: {
            code: "TOKEN_EXPIRED",
            message: "Authentication token has expired",
            requestId,
          },
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Handle rate limit errors
    if (error.message.includes("rate limit")) {
      return new Response(
        JSON.stringify({
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "Too many requests, please try again later",
            requestId,
          },
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    // Default error response
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message:
            process.env.NODE_ENV === "production"
              ? "An internal server error occurred"
              : error.message,
          requestId,
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  };
};
