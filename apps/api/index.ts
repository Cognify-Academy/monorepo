import dotenv from "dotenv";
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { version } from "./package.json";

import authRouter from "./auth";
import conceptRouter from "./concepts";
import courseRouter from "./courses";
import studentRouter from "./students";
import instructorRouter from "./instructors";
import enrollmentRouter from "./enrollments";
import contactRouter from "./contact";
import { healthCheck } from "./health";

import {
  requestLogger,
  requestIdMiddleware,
  generalRateLimiter,
  authRateLimiter,
  AppError,
} from "./middleware";

dotenv.config();

const PORT = process.env["PORT"] || 3333;

const getAllowedOrigins = (): string[] => [
  "https://www.cognify.academy",
  "https://cognify.academy",
  "https://monorepo-production-6b5d.up.railway.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const app = new Elysia({ prefix: "/api/v1" })
  .use(requestIdMiddleware)
  .use(requestLogger)
  .use(generalRateLimiter)
  .use(
    swagger({
      documentation: {
        info: {
          title: "Cognify Academy API",
          version,
          description: "API for Cognify Academy learning platform",
        },
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Enter JWT token",
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
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
        "Cookie",
      ],
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      exposeHeaders: ["Set-Cookie"],
    }),
  )
  .get("/", () => ({ message: "Cognify Academy API is running!" }))
  .get("/health", healthCheck)
  .use(authRouter)
  .use(conceptRouter)
  .use(courseRouter)
  .use(instructorRouter)
  .use(studentRouter)
  .use(enrollmentRouter)
  .use(contactRouter)
  .all("*", () => new Response("Not found", { status: 404 }))
  .listen(Number(PORT));

console.log(`API running on port ${PORT}`);
console.log(
  `Swagger Docs available at http://localhost:${PORT}/api/v1/swagger`,
);
