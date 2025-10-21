# API Middleware

This directory contains comprehensive middleware for the Cognify Academy API built with Elysia.

## Middleware Components

### 1. Error Handler (`error-handler.ts`)

Global error handling middleware that provides consistent error responses across the API.

**Features:**

- Handles different error types (AppError, Zod validation, Prisma, JWT, etc.)
- Logs error details with request context
- Returns structured error responses with request IDs
- Environment-aware error messages (production vs development)

**Usage:**

```typescript
import { errorHandler, AppError } from "./middleware";

// Throw custom errors
throw new AppError("User not found", 404, "USER_NOT_FOUND");

// Use in Elysia app
app.use(errorHandler);
```

### 2. Request Logger (`request-logger.ts`)

Comprehensive request logging middleware that tracks all incoming requests and responses.

**Features:**

- Logs request details (method, URL, user agent, IP)
- Tracks response status and duration
- Includes request ID in all logs
- Different log levels based on response status

**Dependencies:**

- **Requires** `requestIdMiddleware` to be applied first
- Reads request ID from headers set by request-id middleware

**Usage:**

```typescript
import { requestLogger, requestIdMiddleware } from "./middleware";

// Request ID middleware must come first
app.use(requestIdMiddleware).use(requestLogger);
```

### 3. Rate Limiter (`rate-limiter.ts`)

Configurable rate limiting middleware to prevent abuse and ensure fair usage.

**Features:**

- Configurable time windows and request limits
- IP-based rate limiting with custom key generators
- Rate limit headers in responses
- Pre-configured limiters for different use cases
- Automatic cleanup of expired entries

**Pre-configured Limiters:**

- `authRateLimiter`: 5 attempts per 15 minutes for auth endpoints
- `generalRateLimiter`: 100 requests per 15 minutes for general endpoints
- `strictRateLimiter`: 10 requests per minute for sensitive endpoints

**Usage:**

```typescript
import { createRateLimiter, authRateLimiter } from "./middleware";

// Custom rate limiter
const customLimiter = createRateLimiter({
  windowMs: 60000, // 1 minute
  maxRequests: 10,
  keyGenerator: (request) => `custom:${request.headers.get("user-id")}`,
});

// Pre-configured limiter
app.use(authRateLimiter);
```

### 4. Request ID (`request-id.ts`)

Request ID tracking middleware for distributed tracing and debugging.

**Features:**

- Generates unique request IDs if not provided
- Uses existing request ID from headers
- Adds request ID to response headers
- Makes request ID available via headers to other middleware

**Important:**

- This middleware should be applied **first** in the middleware chain
- Other middleware (like `requestLogger`) depend on it
- Provides a single source of truth for request IDs across the application

**Usage:**

```typescript
import { requestIdMiddleware, getRequestId } from "./middleware";

app.use(requestIdMiddleware);

// Request ID is available in request headers
app.get("/test", ({ request }) => {
  const requestId = request.headers.get("x-request-id");
  console.log(`Processing request ${requestId}`);
});
```

## Integration

All middleware is integrated into the main API in `apps/api/index.ts`:

```typescript
const app = new Elysia({ prefix: "/api/v1" })
  // Global middleware (order matters)
  .use(requestIdMiddleware)    // 1. Generate/use request IDs
  .use(requestLogger)          // 2. Log requests
  .use(errorHandler)           // 3. Handle errors
  .use(cors({...}))           // 4. CORS
  .use(swagger({...}))        // 5. API documentation

  // Route-specific rate limiting
  .use(authRateLimiter)       // Auth routes
  .use(authRouter)

  .use(generalRateLimiter)    // Other routes
  .use(conceptRouter)
  // ... other routers
```

## Error Response Format

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {}, // Optional additional details
    "requestId": "unique-request-id"
  }
}
```

## Rate Limit Headers

Rate limiting adds the following headers to responses:

- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Timestamp when the rate limit resets
- `Retry-After`: Seconds to wait before retrying (when rate limited)

## Testing

Run all middleware tests:

```bash
bun test apps/api/middleware/__tests__/
```

Or run individual test suites:

```bash
bun test apps/api/middleware/__tests__/error-handler.spec.ts
bun test apps/api/middleware/__tests__/rate-limiter.spec.ts
bun test apps/api/middleware/__tests__/request-id.spec.ts
bun test apps/api/middleware/__tests__/request-logger.spec.ts
```

The tests are organized into separate files, one for each middleware component:

- `error-handler.spec.ts` - Tests for error handling and AppError class
- `rate-limiter.spec.ts` - Tests for rate limiting functionality
- `request-id.spec.ts` - Tests for request ID generation and tracking
- `request-logger.spec.ts` - Tests for request logging

## Configuration

Environment variables that affect middleware behavior:

- `NODE_ENV`: Controls error message verbosity (production vs development)
- `FRONTEND_URL`: Used for CORS configuration

## Best Practices

1. **Middleware Order**: Request ID → Logger → Error Handler → CORS → Routes
   - ⚠️ **Critical**: `requestIdMiddleware` must come before `requestLogger`
2. **Error Handling**: Use `AppError` for custom application errors
3. **Rate Limiting**: Apply stricter limits to authentication endpoints
4. **Logging**: All logs include request ID for tracing (provided by request-id middleware)
5. **Testing**: Test middleware in isolation and integration
6. **Single Source of Truth**: Use `requestIdMiddleware` for all request ID generation
