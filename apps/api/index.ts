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
import certificatesRouter from "./certificates";
import { healthCheck } from "./health";
import didDocument from "./certificates/did.json";

import {
  requestLogger,
  requestIdMiddleware,
  errorHandler,
  generalRateLimiter,
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

const publicApp = new Elysia().get(
  "/.well-known/did.json",
  () =>
    new Response(JSON.stringify(didDocument), {
      headers: { "Content-Type": "application/json" },
    }),
);

const apiApp = new Elysia({ prefix: "/api/v1" })
  .use(requestIdMiddleware)
  .use(requestLogger)
  .use(errorHandler)
  .use(generalRateLimiter)
  .use(
    swagger({
      documentation: {
        info: {
          title: "Cognify Academy API",
          version,
          description: "API for the Cognify Academy learning platform",
          contact: {
            name: "Cognify Academy Support",
          },
        },
        tags: [
          { name: "Auth", description: "Authentication endpoints" },
          { name: "Students", description: "Student-related endpoints" },
          { name: "Instructors", description: "Instructor-related endpoints" },
          { name: "Courses", description: "Course management endpoints" },
          { name: "Concepts", description: "Concept-related endpoints" },
          {
            name: "Certificates",
            description: "Verifiable credential certificate endpoints",
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Enter your JWT token without 'Bearer ' prefix",
            },
          },
        },
      },
      autoDarkMode: true,
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
  .use(certificatesRouter)
  .all("*", () => new Response("Not found", { status: 404 }));

publicApp.use(apiApp).listen(Number(PORT));

console.log(`API running on port ${PORT}`);
console.log(
  `Swagger Docs available at http://localhost:${PORT}/api/v1/swagger`,
);
