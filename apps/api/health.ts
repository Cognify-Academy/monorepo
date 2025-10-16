import { Elysia } from "elysia";

// Simple health check endpoint
export const healthCheck = () => ({
  status: "healthy",
  timestamp: new Date().toISOString(),
  version: "1.0.0",
});
