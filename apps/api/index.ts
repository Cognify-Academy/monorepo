import dotenv from "dotenv";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";

// Import routers
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

// Load environment variables
dotenv.config();

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

  return origins;
};

// Create the main app with working endpoints
const app = new Elysia({ prefix: "/api/v1" })
  .use(
    swagger({
      documentation: {
        info: {
          title: "Cognify Academy API",
          version: "1.0.0",
          description: "API for Cognify Academy learning platform",
        },
      },
    }),
  )
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
  // Add middleware - temporarily disabled for testing
  // .use(requestIdMiddleware)
  // .use(requestLogger)
  .get("/", () => ({ message: "Cognify Academy API is running!" }))
  .get("/health", () => ({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  }))
  // Add routers
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
