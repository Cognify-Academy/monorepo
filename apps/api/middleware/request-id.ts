import { Elysia } from "elysia";

export const requestIdMiddleware = new Elysia({ name: "request-id" })
  .derive({ as: "global" }, ({ request, set }) => {
    let requestId = request.headers.get("x-request-id") || generateRequestId();
    set.headers["X-Request-ID"] = requestId;
    return { requestId };
  })
  .as("plugin");

function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

export function getRequestId(context: any): string {
  return context.requestId || "unknown";
}
