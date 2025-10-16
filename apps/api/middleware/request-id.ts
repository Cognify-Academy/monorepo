import { Elysia } from "elysia";

export const requestIdMiddleware = new Elysia({ name: "request-id" }).onRequest(
  ({ request, set }) => {
    // Check if request ID already exists
    let requestId = request.headers.get("x-request-id") || generateRequestId();
    set.headers["X-Request-ID"] = requestId;
    return { requestId };
  },
);

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

export function getRequestId(context: any): string {
  return context.requestId || "unknown";
}
