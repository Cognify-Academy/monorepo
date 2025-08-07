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

const PORT = process.env.PORT || 3333;

dotenv.config();

const app = new Elysia({ prefix: "/api/v1" })
  .use(cors())
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
  .listen(PORT);

console.log(`API running on port ${PORT}`);
console.log(`Swagger Docs available at http://localhost:${PORT}/swagger`);
