import { Elysia, NotFoundError, t } from "elysia";
import AuthService from "../auth/service";
import {
  createEnrollment,
  getEnrollments,
  getEnrollment,
  deleteEnrollment,
} from "./model";

export default new Elysia({ prefix: "/enrollments" })
  .use(AuthService)
  .post(
    "/",
    async ({
      body,
      Auth: { hasRole, user },
    }: {
      body: { courseId: string };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string } | null;
      };
    }) => {
      try {
        const { courseId } = body;

        if (!user || !hasRole("STUDENT")) {
          throw new Error(
            "Unauthorized - User must have STUDENT role to enroll",
          );
        }

        const enrollment = await createEnrollment({
          userId: user.id,
          courseId,
        });

        return {
          message: "Enrollment created successfully",
          enrollment: {
            ...enrollment,
            createdAt: enrollment.createdAt.toISOString(),
          },
        };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        }
        throw new Error("Internal server error");
      }
    },
    {
      detail: {
        tags: ["Enrollments"],
        description:
          "Create a new enrollment for the authenticated student in a course",
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      body: t.Object({
        courseId: t.String({ description: "The course ID" }),
      }),
      response: {
        201: t.Object({
          message: t.String(),
          enrollment: t.Object({
            id: t.String(),
            userId: t.String(),
            courseId: t.String(),
            createdAt: t.String(),
            user: t.Object({
              id: t.String(),
              name: t.String(),
              email: t.String(),
            }),
            course: t.Object({
              id: t.String(),
              title: t.String(),
              slug: t.String(),
            }),
          }),
        }),
        400: t.Object({
          error: t.String(),
        }),
        401: t.Object({
          error: t.String(),
        }),
        403: t.Object({
          error: t.String(),
        }),
        404: t.Object({
          error: t.String(),
        }),
        409: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .get(
    "/",
    async ({
      query,
      Auth: { user },
    }: {
      query: { courseId?: string; page?: string; limit?: string };
      Auth: {
        user: { id: string } | null;
      };
    }) => {
      try {
        if (!user) {
          throw new Error("Unauthorized - User must be authenticated");
        }

        const { courseId, page = "1", limit = "10" } = query;

        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;

        const result = await getEnrollments({
          userId: user.id,
          courseId: courseId as string,
          page: pageNum,
          limit: limitNum,
        });

        return {
          enrollments: result.enrollments.map((enrollment) => ({
            ...enrollment,
            createdAt: enrollment.createdAt.toISOString(),
          })),
          pagination: result.pagination,
        };
      } catch (error) {
        throw new Error("Internal server error");
      }
    },
    {
      detail: {
        tags: ["Enrollments"],
        description:
          "Get enrollments for the authenticated user with optional course filtering",
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      query: t.Object({
        courseId: t.Optional(t.String({ description: "Filter by course ID" })),
        page: t.Optional(t.String({ description: "Page number" })),
        limit: t.Optional(t.String({ description: "Items per page" })),
      }),
      response: {
        200: t.Object({
          enrollments: t.Array(
            t.Object({
              id: t.String(),
              userId: t.String(),
              courseId: t.String(),
              createdAt: t.String(),
              user: t.Object({
                id: t.String(),
                name: t.String(),
                email: t.String(),
              }),
              course: t.Object({
                id: t.String(),
                title: t.String(),
                slug: t.String(),
              }),
            }),
          ),
          pagination: t.Object({
            page: t.Number(),
            limit: t.Number(),
            total: t.Number(),
            pages: t.Number(),
          }),
        }),
        401: t.Object({
          error: t.String(),
        }),
        500: t.Object({
          error: t.String(),
        }),
      },
    },
  )

  .get(
    "/:id",
    async ({
      params,
      Auth: { user },
    }: {
      params: { id: string };
      Auth: {
        user: { id: string } | null;
      };
    }) => {
      try {
        if (!user) {
          throw new Error("Unauthorized - User must be authenticated");
        }

        const { id } = params;

        const enrollment = await getEnrollment(id);

        if (!enrollment) {
          throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.userId !== user.id) {
          throw new Error(
            "Unauthorized - Cannot access other user's enrollment",
          );
        }

        return {
          enrollment: {
            ...enrollment,
            createdAt: enrollment.createdAt.toISOString(),
          },
        };
      } catch (error) {
        if (error instanceof NotFoundError) {
          throw error;
        }
        throw new Error("Internal server error");
      }
    },
    {
      detail: {
        tags: ["Enrollments"],
        description:
          "Get a specific enrollment by ID (user can only access their own enrollments)",
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        id: t.String({ description: "The enrollment ID" }),
      }),
      response: {
        200: t.Object({
          enrollment: t.Object({
            id: t.String(),
            userId: t.String(),
            courseId: t.String(),
            createdAt: t.String(),
            user: t.Object({
              id: t.String(),
              name: t.String(),
              email: t.String(),
            }),
            course: t.Object({
              id: t.String(),
              title: t.String(),
              slug: t.String(),
            }),
          }),
        }),
        401: t.Object({
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

  .delete(
    "/:id",
    async ({
      params,
      Auth: { user },
    }: {
      params: { id: string };
      Auth: {
        user: { id: string } | null;
      };
    }) => {
      try {
        if (!user) {
          throw new Error("Unauthorized - User must be authenticated");
        }

        const { id } = params;

        const enrollment = await getEnrollment(id);
        if (!enrollment) {
          throw new NotFoundError("Enrollment not found");
        }

        if (enrollment.userId !== user.id) {
          throw new Error(
            "Unauthorized - Cannot delete other user's enrollment",
          );
        }

        await deleteEnrollment(id);

        return { message: "Enrollment removed successfully" };
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "Enrollment not found"
        ) {
          throw new NotFoundError("Enrollment not found");
        }
        throw new Error("Internal server error");
      }
    },
    {
      detail: {
        tags: ["Enrollments"],
        description:
          "Remove an enrollment by ID (user can only delete their own enrollments)",
      },
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        id: t.String({ description: "The enrollment ID" }),
      }),
      response: {
        200: t.Object({
          message: t.String(),
        }),
        401: t.Object({
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
  );
