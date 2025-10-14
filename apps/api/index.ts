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

const PORT = process.env["PORT"] || 3333;

dotenv.config();

// Configure allowed origins for CORS
const getAllowedOrigins = () => {
  const origins = [];

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
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
      exposedHeaders: ["Set-Cookie"],
    }),
  )
  .use(swagger({ path: "/swagger" }))
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
