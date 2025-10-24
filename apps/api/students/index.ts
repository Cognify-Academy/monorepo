import { Elysia, t } from "elysia";
import AuthService from "../auth/service";
import {
  getCourses,
  getProfile,
  recordLessonProgress,
  getLessonProgress,
  getStudentProgress,
  getConceptsFromCompletedLessons,
} from "./model";

export default new Elysia({ prefix: "/student" })
  .use(AuthService)
  .get(
    "/profile",
    async ({ Auth: { user } }) => {
      if (!user?.id)
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return await getProfile({ userId: user.id });
    },
    {
      detail: {
        description: "Get current logged in student profile",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
      },
      response: {
        200: t.Object({
          id: t.Optional(t.String()),
          email: t.Optional(t.String()),
          username: t.Optional(t.String()),
          name: t.Optional(t.String()),
          createdAt: t.Optional(t.String()),
          updatedAt: t.Optional(t.String()),
        }),
        403: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .get(
    "/courses",
    async ({
      Auth: { hasRole, user },
    }: {
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string } | null;
      };
    }) => {
      if (!hasRole("STUDENT") || !user?.id)
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return await getCourses({ userId: user.id });
    },
    {
      detail: {
        description: "Get all current students enrolled on courses",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      response: {
        200: t.Array(
          t.Object({
            id: t.String(),
            title: t.String(),
            slug: t.String(),
            description: t.String(),
            published: t.Boolean(),
            userId: t.String(),
            createdAt: t.String(),
            updatedAt: t.String(),
            conceptIds: t.Array(t.String()),
          }),
        ),
        403: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .post(
    "/lessons/progress",
    async ({
      body,
      Auth: { hasRole, user },
    }: {
      body: { lessonId: string; completed: boolean };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string } | null;
      };
    }) => {
      try {
        if (!hasRole("STUDENT") || !user?.id) {
          return new Response(
            JSON.stringify({
              error: "Forbidden - User must have STUDENT role",
            }),
            { status: 403, headers: { "Content-Type": "application/json" } },
          );
        }

        const { lessonId, completed } = body;

        if (!lessonId) {
          return new Response(
            JSON.stringify({ error: "Lesson ID is required" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        const progress = await recordLessonProgress({
          userId: user.id,
          lessonId,
          completed,
        });

        return {
          message: "Lesson progress recorded successfully",
          progress,
        };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Lesson not found") {
            throw new Error("Lesson not found");
          }
          if (error.message === "User not found") {
            throw new Error("User not found");
          }
          throw new Error(error.message);
        }
        throw new Error("Internal server error");
      }
    },
    {
      detail: {
        description: "Record student progress for a lesson",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      body: t.Object({
        lessonId: t.String({ description: "The lesson ID" }),
        completed: t.Boolean({
          description: "Whether the lesson is completed",
        }),
      }),
      response: {
        201: t.Object({
          message: t.String(),
          progress: t.Object({
            id: t.String(),
            userId: t.String(),
            lessonId: t.String(),
            completed: t.Boolean(),
            completedAt: t.Optional(t.String()),
            createdAt: t.String(),
            updatedAt: t.String(),
          }),
        }),
        400: t.Object({
          error: t.String(),
        }),
        403: t.Object({
          error: t.String(),
        }),
        404: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .get(
    "/lessons/:lessonId/progress",
    async ({
      params,
      Auth: { hasRole, user },
    }: {
      params: { lessonId: string };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string } | null;
      };
    }) => {
      if (!hasRole("STUDENT") || !user?.id) {
        throw new Error("Forbidden - User must have STUDENT role");
      }

      const { lessonId } = params;

      const progress = await getLessonProgress({
        userId: user.id,
        lessonId,
      });

      return { progress };
    },
    {
      detail: {
        description: "Get student progress for a specific lesson",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        lessonId: t.String({ description: "The lesson ID" }),
      }),
      response: {
        200: t.Object({
          progress: t.Union([
            t.Object({
              id: t.String(),
              userId: t.String(),
              lessonId: t.String(),
              completed: t.Boolean(),
              completedAt: t.Optional(t.String()),
              createdAt: t.String(),
              updatedAt: t.String(),
            }),
            t.Null(),
          ]),
        }),
        403: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .get(
    "/progress",
    async ({
      query,
      Auth: { hasRole, user },
    }: {
      query: { courseId?: string };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string } | null;
      };
    }) => {
      if (!hasRole("STUDENT") || !user?.id) {
        throw new Error("Forbidden - User must have STUDENT role");
      }

      const { courseId } = query;

      const progress = await getStudentProgress({
        userId: user.id,
        courseId: courseId || undefined,
      });

      return { progress };
    },
    {
      detail: {
        description: "Get all lesson progress for the authenticated student",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      query: t.Object({
        courseId: t.Optional(t.String({ description: "Filter by course ID" })),
      }),
      response: {
        200: t.Object({
          progress: t.Array(
            t.Object({
              id: t.String(),
              userId: t.String(),
              lessonId: t.String(),
              completed: t.Boolean(),
              completedAt: t.Optional(t.String()),
              createdAt: t.String(),
              updatedAt: t.String(),
              lesson: t.Object({
                id: t.String(),
                title: t.String(),
                description: t.String(),
                order: t.Number(),
                sectionId: t.String(),
                content: t.Any(),
                createdAt: t.String(),
                updatedAt: t.String(),
                section: t.Object({
                  id: t.String(),
                  title: t.String(),
                  description: t.String(),
                  courseId: t.String(),
                  order: t.Number(),
                  createdAt: t.String(),
                  updatedAt: t.String(),
                  course: t.Object({
                    id: t.String(),
                    title: t.String(),
                    slug: t.String(),
                    description: t.String(),
                    published: t.Boolean(),
                    userId: t.String(),
                    createdAt: t.String(),
                    updatedAt: t.String(),
                  }),
                }),
              }),
            }),
          ),
        }),
        403: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .get(
    "/concepts/completed",
    async ({
      Auth: { hasRole, user },
    }: {
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string } | null;
      };
    }) => {
      if (!hasRole("STUDENT") || !user?.id) {
        throw new Error("Forbidden - User must have STUDENT role");
      }

      const concepts = await getConceptsFromCompletedLessons({
        userId: user.id,
      });

      return { concepts };
    },
    {
      detail: {
        description:
          "Get concepts from completed lessons for the authenticated student",
        tags: ["Students"],
        security: [{ bearerAuth: [] }],
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      response: {
        200: t.Object({
          concepts: t.Array(
            t.Object({
              id: t.String(),
              name: t.String(),
              slug: t.String(),
              description: t.String(),
              importance: t.Number(),
              createdAt: t.String(),
              updatedAt: t.String(),
              conceptSource: t.Array(
                t.Object({
                  id: t.String(),
                  conceptSourceId: t.String(),
                  conceptTargetId: t.String(),
                  description: t.String(),
                  weighting: t.Optional(t.Number()),
                }),
              ),
              conceptTarget: t.Array(
                t.Object({
                  id: t.String(),
                  conceptSourceId: t.String(),
                  conceptTargetId: t.String(),
                  description: t.String(),
                  weighting: t.Optional(t.Number()),
                }),
              ),
              completedLessons: t.Array(
                t.Object({
                  lessonId: t.String(),
                  lessonTitle: t.String(),
                  completedAt: t.Optional(t.String()),
                }),
              ),
            }),
          ),
        }),
        403: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    },
  );
