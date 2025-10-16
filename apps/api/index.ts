import dotenv from "dotenv";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

import authRouter from "./auth";
import conceptRouter from "./concepts";
import courseRouter from "./courses";
import studentRouter from "./students";
import instructorRouter from "./instructors";
import enrollmentRouter from "./enrollments";
import contactRouter from "./contact";
import kanban from "./kanban";

// Import middleware
import {
  requestLogger,
  requestIdMiddleware,
  generalRateLimiter,
  authRateLimiter,
  AppError,
} from "./middleware";

// Load environment variables from the correct path
// In production (Docker), the .env file is in the root directory
// In development, it's in ./apps/api/.env
const envPath =
  process.env.NODE_ENV === "production" ? "./.env" : "./apps/api/.env";
console.log("Loading environment from:", envPath);
console.log("NODE_ENV:", process.env.NODE_ENV);
dotenv.config({ path: envPath });

// Debug environment variables
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
console.log("JWT_REFRESH_SECRET exists:", !!process.env.JWT_REFRESH_SECRET);
console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);

const PORT = process.env["PORT"] || 3333;

// Configure allowed origins for CORS
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [];

  // Add production domain
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  // Add additional production domains
  origins.push("https://www.cognify.academy");
  origins.push("https://cognify.academy");

  // Add development domains
  origins.push("http://localhost:3000");
  origins.push("http://127.0.0.1:3000");

  console.log("Configured CORS origins:", origins);
  return origins;
};

const app = new Elysia({ prefix: "/api/v1" })
  .use(
    cors({
      origin: getAllowedOrigins(),
      credentials: true,
      allowedHeaders: [
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    }),
  )
  .use(swagger({ path: "/swagger" }))
  // Other middleware
  .use(requestIdMiddleware)
  .use(requestLogger)
  .use(authRouter)
  .use(conceptRouter)
  .use(courseRouter)
  .use(instructorRouter)
  .use(studentRouter)
  .use(enrollmentRouter)
  .use(contactRouter)
  .use(kanban)
  .all("*", () => new Response("Not found", { status: 404 }))
  .listen(Number(PORT));

console.log(`API running on port ${PORT}`);
console.log(`Swagger Docs available at http://localhost:${PORT}/swagger`);
