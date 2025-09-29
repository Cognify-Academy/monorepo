import { Elysia, NotFoundError, t } from "elysia";
import { getCourse, getCourses, enrolStudent } from "./model";
import AuthService from "../auth/service";

export default new Elysia({ prefix: "/courses" })
  .use(AuthService)
  .get(
    "/",
    async () => {
      const courses = await getCourses();
      return courses.map((course) => ({
        ...course,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
        instructors: course.instructors.map((instructor) => ({
          id: instructor.id,
        })),
      }));
    },
    {
      detail: { tags: ["Courses"] },
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            title: t.String(),
            slug: t.String(),
            description: t.String(),
            published: t.Boolean(),
            createdAt: t.String(),
            updatedAt: t.String(),
            userId: t.String(),
            instructors: t.Array(
              t.Object({
                id: t.String(),
              }),
            ),
            conceptIds: t.Array(t.String()),
          }),
        ),
      },
    },
  )
  .get(
    "/:identifier",
    async ({ params }) => {
      const course = await getCourse(params.identifier);

      if (!course) {
        throw new NotFoundError("Course not found");
      }

      return {
        ...course,
        createdAt: course.createdAt.toISOString(),
        updatedAt: course.updatedAt.toISOString(),
      };
    },
    {
      detail: { tags: ["Courses"] },
      params: t.Object({
        identifier: t.String({ description: "The course ID or slug" }),
      }),
      response: {
        200: t.Object({
          id: t.String(),
          title: t.String(),
          slug: t.String(),
          description: t.String(),
          published: t.Boolean(),
          createdAt: t.String(),
          updatedAt: t.String(),
          userId: t.String(),
          conceptIds: t.Array(t.String()),
          sections: t.Array(
            t.Object({
              id: t.String(),
              title: t.String(),
              description: t.String(),
              order: t.Number(),
              conceptIds: t.Array(t.String()),
              lessons: t.Array(
                t.Object({
                  id: t.String(),
                  title: t.String(),
                  description: t.String(),
                  content: t.Any(),
                  order: t.Number(),
                  conceptIds: t.Array(t.String()),
                  media: t.Array(
                    t.Object({
                      id: t.String(),
                      title: t.String(),
                      description: t.String(),
                      mediaType: t.String(),
                      content: t.Optional(t.String()),
                      url: t.Optional(t.String()),
                      notes: t.Optional(t.String()),
                      transcript: t.Optional(t.String()),
                      metadata: t.Optional(t.Any()),
                      createdAt: t.String(),
                      updatedAt: t.String(),
                    }),
                  ),
                }),
              ),
            }),
          ),
        }),
        404: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .post(
    "/:identifier/students",
    async ({
      Auth: { hasRole, user },
      params,
    }: {
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string } | null;
      };
      params: {
        identifier: string;
      };
    }) => {
      if (!user || !hasRole("STUDENT")) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      const enrolment = await enrolStudent({
        identifier: params.identifier,
        userId: user.id,
      });
      return { message: "Student enrolled successfully", ...enrolment };
    },
    {
      detail: { tags: ["Courses"], description: "Enrol a student in a course" },
      headers: t.Object({
        authorization: t.Optional(
          t.String({ description: "Authorization token" }),
        ),
      }),
      params: t.Object({
        identifier: t.String(),
      }),
      response: {
        200: t.Object({
          message: t.String(),
        }),
      },
    },
  );
