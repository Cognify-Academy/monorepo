import { Elysia } from "elysia";

interface LogContext {
  requestId: string;
  method: string;
  url: string;
  userAgent?: string;
  ip?: string;
  startTime: number;
}

export const requestLogger = new Elysia({ name: "request-logger" })
  .derive(({ request }) => {
    const requestId =
      request.headers.get("x-request-id") || generateRequestId();
    const startTime = Date.now();

    return {
      requestId,
      startTime,
    };
  })
  .onRequest(({ request, requestId, startTime }: any) => {
    const logContext: LogContext = {
      requestId,
      method: request.method,
      url: request.url,
      userAgent: request.headers.get("user-agent") || undefined,
      ip: getClientIP(request),
      startTime,
    };

    console.log(`[${requestId}] ${request.method} ${request.url}`, {
      userAgent: logContext.userAgent,
      ip: logContext.ip,
      timestamp: new Date().toISOString(),
    });
  })
  .onAfterHandle(({ request, response, requestId, startTime }: any) => {
    const duration = Date.now() - startTime;
    const status = (response as Response)?.status || 200;

    const logLevel = status >= 400 ? "error" : status >= 300 ? "warn" : "info";

    console[logLevel](
      `[${requestId}] ${request.method} ${request.url} - ${status} (${duration}ms)`,
      {
        status,
        duration,
        timestamp: new Date().toISOString(),
      },
    );
  });

function generateRequestId(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

function getClientIP(request: Request): string {
  // Check various headers for client IP
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");

  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(",")[0].trim();

  return "unknown";
}
