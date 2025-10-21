import { Elysia } from "elysia";

interface LogStore {
  start?: number;
}

export const requestLogger = new Elysia({ name: "request-logger" })
  .derive(() => ({ store: { start: undefined } as LogStore }))
  .onRequest(({ store }: { store: LogStore }) => {
    store.start = performance.now();
  })
  .onAfterHandle(
    ({
      request,
      set,
      store,
      requestId,
    }: {
      request: Request;
      set: any;
      store: LogStore;
      requestId?: string;
    }) => {
      const id = requestId || request.headers.get("x-request-id") || "unknown";
      const duration = store.start
        ? (performance.now() - store.start).toFixed(2)
        : "0";
      const statusCode = typeof set.status === "number" ? set.status : 200;
      const logLevel: "error" | "warn" | "info" =
        statusCode >= 400 ? "error" : statusCode >= 300 ? "warn" : "info";
      console[logLevel](
        `[${id}] ${request.method} ${request.url} - ${statusCode} (${duration}ms)`,
        {
          status: statusCode,
          duration: parseFloat(duration),
          timestamp: new Date().toISOString(),
        },
      );
    },
  )
  .as("plugin");
