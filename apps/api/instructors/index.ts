import { Elysia, NotFoundError, t } from "elysia";
import AuthService from "../auth/service";
import {
  createCourse,
  createLesson,
  createSection,
  deleteLesson,
  deleteCourse,
  getCourse,
  getCourses,
  updateCourse,
  updateLesson,
  updateSection,
  updateCourseSectionOrder,
  updateCourseLessonOrder,
  deleteSection,
  createMedia,
  updateMedia,
  getMedia,
  getAllMedia,
  deleteMedia,
} from "./model";

interface Instructor {
  id: string;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  instructors: Instructor[];
  conceptIds: string[];
}

interface MappedCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  instructors: { id: string }[];
  conceptIds: string[];
}

export default new Elysia({ prefix: "/instructor/courses" })
  .use(AuthService)
  .get(
    "/",
    async ({ Auth: { hasRole, user } }) => {
      if (!user?.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (!hasRole("INSTRUCTOR")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      const courses = await getCourses(user.id);

      return courses.map(
        (course: Course): MappedCourse => ({
          ...course,
          createdAt: course.createdAt.toISOString(),
          updatedAt: course.updatedAt.toISOString(),
          instructors: course.instructors.map((instructor: Instructor) => ({
            id: instructor.id,
          })),
        }),
      );
    },
    {
      detail: { tags: ["Instructor Courses"] },
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
        401: t.Object({
          error: t.String(),
        }),
        403: t.Object({
          error: t.String(),
        }),
      },
    },
  )
  .post(
    "/",
    async ({
      Auth: { hasRole, user },
      body,
    }: {
      body: {
        title: string;
        description: string;
        conceptIds: string[];
        published?: boolean;
      };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return createCourse({ ...body, userId: user.id });
    },
    {
      detail: { tags: ["Instructor Courses"] },
      body: t.Object({
        title: t.String(),
        description: t.String(),
        conceptIds: t.Array(t.String()),
        published: t.Optional(t.Boolean()),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
    },
  )
  .patch(
    "/:courseId",
    async ({
      Auth: { hasRole, user },
      body,
      params,
    }: {
      body: {
        title?: string;
        description?: string;
        conceptIds?: string[];
        published?: boolean;
      };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
      params: {
        courseId: string;
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      const payload: {
        id: string;
        userId: string;
        title?: string;
        description?: string;
        conceptIds?: string[];
        published?: boolean;
      } = { id: params.courseId, userId: user.id };
      if (body.title) payload.title = body.title;
      if (body.description) payload.description = body.description;
      if (body.conceptIds) payload.conceptIds = body.conceptIds;
      if (body.published) payload.published = body.published;
      return await updateCourse(payload);
    },
    {
      detail: { tags: ["Instructor Courses"] },
      body: t.Object({
        title: t.String(),
        description: t.String(),
        conceptIds: t.Array(t.String()),
        published: t.Optional(t.Boolean()),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        courseId: t.String(),
      }),
    },
  )
  .delete(
    "/:courseId",
    async ({ Auth: { hasRole, user }, params }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }

      try {
        await deleteCourse({
          id: params.courseId,
          userId: user.id,
        });
        return { message: "Course deleted successfully" };
      } catch (error) {
        if (error instanceof Error) {
          if (error.message === "Course not found") {
            return new Response(JSON.stringify({ error: "Course not found" }), {
              status: 404,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (error.message === "Unauthorized to delete this course") {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
          if (error.message.includes("Cannot delete course with sections")) {
            return new Response(JSON.stringify({ error: error.message }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }
        }
        return new Response(
          JSON.stringify({ error: "Internal server error" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    },
    {
      detail: { tags: ["Instructor Courses"] },
      params: t.Object({
        courseId: t.String(),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      response: {
        200: t.Object({
          message: t.String(),
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
  .group("/media", (app) =>
    app
      .use(AuthService)
      .post(
        "/",
        async ({
          Auth: { hasRole, user },
          body,
        }: {
          body: {
            title: string;
            description: string;
            mediaType: string;
            content?: string;
            url?: string;
            notes?: string;
            transcript?: string;
            lessonId: string;
            metadata?: any;
          };
          Auth: {
            hasRole: (role: string) => boolean;
            user: { id: string };
          };
        }) => {
          console.log("Creating media");
          if (!hasRole("INSTRUCTOR"))
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          return createMedia({ ...body, userId: user.id });
        },
        {
          detail: { tags: ["Instructor Media"] },
          body: t.Object({
            title: t.String(),
            description: t.String(),
            mediaType: t.String(),
            content: t.Optional(t.String()),
            url: t.Optional(t.String()),
            notes: t.Optional(t.String()),
            transcript: t.Optional(t.String()),
            lessonId: t.String(),
            metadata: t.Optional(t.Any()),
          }),
          headers: t.Object({
            authorization: t.String({ description: "Authorization token" }),
          }),
        },
      )
      .patch(
        "/:mediaId",
        async ({
          Auth: { hasRole, user },
          body,
          params,
        }: {
          body: {
            title?: string;
            description?: string;
            mediaType?: string;
            content?: string;
            url?: string;
            notes?: string;
            transcript?: string;
            metadata?: any;
          };
          Auth: {
            hasRole: (role: string) => boolean;
            user: { id: string };
          };
          params: {
            mediaId: string;
          };
        }) => {
          if (!hasRole("INSTRUCTOR"))
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          return await updateMedia({
            id: params.mediaId,
            userId: user.id,
            ...body,
          });
        },
        {
          detail: { tags: ["Instructor Media"] },
          body: t.Object({
            title: t.Optional(t.String()),
            description: t.Optional(t.String()),
            mediaType: t.Optional(t.String()),
            content: t.Optional(t.String()),
            url: t.Optional(t.String()),
            notes: t.Optional(t.String()),
            transcript: t.Optional(t.String()),
            metadata: t.Optional(t.Any()),
          }),
          headers: t.Object({
            authorization: t.String({ description: "Authorization token" }),
          }),
          params: t.Object({
            mediaId: t.String(),
          }),
        },
      )
      .get(
        "/:mediaId",
        async ({ Auth: { hasRole }, params }) => {
          if (!hasRole("INSTRUCTOR") && !hasRole("STUDENT")) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
          const media = await getMedia(params.mediaId);
          if (!media) {
            throw new NotFoundError("Media not found");
          }
          return {
            ...media,
            createdAt: media.createdAt.toISOString(),
            updatedAt: media.updatedAt.toISOString(),
          };
        },
        {
          detail: { tags: ["Instructor Media"] },
          params: t.Object({
            mediaId: t.String(),
          }),
          headers: t.Object({
            authorization: t.String({ description: "Authorization token" }),
          }),
          response: {
            200: t.Object({
              id: t.String(),
              title: t.String(),
              description: t.String(),
              mediaType: t.String(),
              content: t.Nullable(t.String()),
              url: t.Nullable(t.String()),
              notes: t.Nullable(t.String()),
              transcript: t.Nullable(t.String()),
              lessonId: t.Nullable(t.String()),
              metadata: t.Nullable(t.Any()),
              createdAt: t.String(),
              updatedAt: t.String(),
            }),
            403: t.Object({
              error: t.String(),
            }),
            404: t.Object({
              error: t.String(),
            }),
          },
        },
      )
      .get(
        "/",
        async ({ Auth: { hasRole }, query }) => {
          if (
            !query.lessonId ||
            (!hasRole("INSTRUCTOR") && !hasRole("STUDENT"))
          ) {
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }
          const medias = await getAllMedia(query.lessonId);
          return medias.map((media) => ({
            ...media,
            createdAt: media.createdAt.toISOString(),
            updatedAt: media.updatedAt.toISOString(),
          }));
        },
        {
          detail: { tags: ["Instructor Media"] },
          query: t.Object({
            lessonId: t.Optional(t.String()),
          }),
          headers: t.Object({
            authorization: t.String({ description: "Authorization token" }),
          }),
          response: {
            200: t.Array(
              t.Object({
                id: t.String(),
                title: t.String(),
                description: t.String(),
                mediaType: t.String(),
                content: t.Nullable(t.String()),
                url: t.Nullable(t.String()),
                notes: t.Nullable(t.String()),
                transcript: t.Nullable(t.String()),
                lessonId: t.Nullable(t.String()),
                metadata: t.Nullable(t.Any()),
                createdAt: t.String(),
                updatedAt: t.String(),
              }),
            ),
            403: t.Object({
              error: t.String(),
            }),
          },
        },
      )
      .delete(
        "/:mediaId",
        async ({
          Auth: { hasRole, user },
          params,
        }: {
          Auth: {
            hasRole: (role: string) => boolean;
            user: { id: string };
          };
          params: {
            mediaId: string;
          };
        }) => {
          if (!hasRole("INSTRUCTOR"))
            return new Response(JSON.stringify({ error: "Forbidden" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          return await deleteMedia({
            id: params.mediaId,
            userId: user.id,
          });
        },
        {
          detail: { tags: ["Instructor Media"] },
          params: t.Object({
            mediaId: t.String(),
          }),
          headers: t.Object({
            authorization: t.String({ description: "Authorization token" }),
          }),
        },
      ),
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
      detail: { tags: ["Instructor Courses"] },
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
                      content: t.Nullable(t.String()),
                      url: t.Nullable(t.String()),
                      notes: t.Nullable(t.String()),
                      transcript: t.Nullable(t.String()),
                      metadata: t.Nullable(t.Any()),
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
    "/:courseId/sections",
    async ({
      Auth: { hasRole, user },
      body,
      params,
    }: {
      body: {
        title: string;
        description: string;
        content: any;
        conceptIds: string[];
      };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
      params: {
        courseId: string;
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      try {
        const section = createSection({
          ...body,
          id: params.courseId,
          userId: user.id,
        });
        return section;
      } catch (err) {
        return new Response(JSON.stringify({ error: "Not authorized" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
    },
    {
      detail: { tags: ["Instructor Courses"] },
      body: t.Object({
        title: t.String(),
        description: t.String(),
        conceptIds: t.Array(t.String()),
      }),
      params: t.Object({
        courseId: t.String(),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
    },
  )
  .patch(
    "/:courseId/sections/order",
    async ({
      params,
      body,
      Auth: { hasRole, user },
    }: {
      params: { courseId: string };
      body: { order: { id: string; order: number }[] };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      const { order } = body;
      return await updateCourseSectionOrder({
        userId: user.id,
        id: params.courseId,
        order,
      });
    },
    {
      detail: { tags: ["Instructor Courses"] },
      body: t.Object({
        order: t.Array(
          t.Object({
            id: t.String(),
            order: t.Number(),
          }),
        ),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        courseId: t.String(),
      }),
    },
  )
  .patch(
    "/:courseId/sections/:sectionId",
    async ({
      Auth: { hasRole, user },
      body,
      params,
    }: {
      body: {
        title?: string;
        description?: string;
        conceptIds?: string[];
      };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
      params: {
        sectionId: string;
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      const payload: {
        id: string;
        userId: string;
        title?: string;
        description?: string;
        conceptIds?: string[];
      } = { id: params.sectionId, userId: user.id };
      if (body.title !== undefined) payload.title = body.title;
      if (body.description !== undefined)
        payload.description = body.description;
      if (body.conceptIds !== undefined) payload.conceptIds = body.conceptIds;
      return await updateSection(payload);
    },
    {
      detail: { tags: ["Instructor Courses"] },
      body: t.Object({
        title: t.String(),
        description: t.String(),
        conceptIds: t.Array(t.String()),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
    },
  )
  .delete(
    "/:courseId/sections/:sectionId",
    async ({
      params,
      Auth: { hasRole, user },
    }: {
      params: { sectionId: string };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return await deleteSection({ id: params.sectionId, userId: user.id });
    },
    {
      detail: { tags: ["Instructor Courses"] },
      params: t.Object({
        courseId: t.String(),
        sectionId: t.String(),
      }),
    },
  )
  .post(
    "/:courseId/sections/:sectionId/lessons",
    async ({
      Auth: { hasRole, user },
      body,
      params,
    }: {
      body: {
        title: string;
        description: string;
        content: string;
        conceptIds: string[];
      };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
      params: {
        sectionId: string;
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      return await createLesson({
        sectionId: params.sectionId,
        title: body.title,
        description: body.description,
        content: body.content,
        conceptIds: body.conceptIds,
        userId: user.id,
      });
    },
    {
      detail: { tags: ["Instructor Courses"] },
    },
  )
  .patch(
    "/:courseId/lessons/order",
    async ({
      params,
      body,
      Auth: { hasRole, user },
    }: {
      params: { courseId: string };
      body: { ordering: { id: string; sectionId: string; order: number }[] };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });

      const { ordering } = body;
      console.log("Received lesson reorder request:", {
        courseId: params.courseId,
        userId: user.id,
        ordering,
        orderingLength: ordering.length,
      });

      try {
        const result = await updateCourseLessonOrder({
          userId: user.id,
          courseId: params.courseId,
          ordering,
        });
        console.log("Lesson reorder completed successfully:");
        return result;
      } catch (error) {
        console.error("Lesson reorder failed:", error);
        throw error;
      }
    },
    {
      detail: { tags: ["Instructor Courses"] },
      body: t.Object({
        ordering: t.Array(
          t.Object({
            id: t.String(),
            sectionId: t.String(),
            order: t.Number(),
          }),
        ),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
      params: t.Object({
        courseId: t.String(),
      }),
    },
  )
  .patch(
    "/:courseId/sections/:sectionId/lessons/:lessonId",
    async ({
      Auth: { hasRole, user },
      body,
      params,
    }: {
      body: {
        title?: string;
        description?: string;
        content?: string;
        conceptIds?: string[];
      };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
      params: {
        sectionId: string;
        lessonId: string;
      };
    }) => {
      if (!hasRole("INSTRUCTOR"))
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });

      return await updateLesson({
        lessonId: params.lessonId,
        sectionId: params.sectionId,
        updates: {
          ...(body.title && { title: body.title }),
          ...(body.description && { description: body.description }),
          ...(body.content && { content: body.content }),
          ...(body.conceptIds && { conceptIds: body.conceptIds }),
        },
        userId: user.id,
      });
    },
    {
      detail: { tags: ["Instructor Courses"] },
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        content: t.Optional(t.String()),
        conceptIds: t.Optional(t.Array(t.String())),
      }),
      params: t.Object({
        courseId: t.String(),
        sectionId: t.String(),
        lessonId: t.String(),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
    },
  )
  .delete(
    "/:courseId/sections/:sectionId/lessons/:lessonId",
    async ({
      params,
      Auth: { hasRole, user },
    }: {
      params: { lessonId: string; sectionId: string };
      Auth: {
        hasRole: (role: string) => boolean;
        user: { id: string };
      };
    }) => {
      if (!hasRole("INSTRUCTOR")) {
        return new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        });
      }
      return await deleteLesson({
        id: params.lessonId,
        sectionId: params.sectionId,
        userId: user.id,
      });
    },
    {
      detail: { tags: ["Instructor Courses"] },
      params: t.Object({
        courseId: t.String(),
        sectionId: t.String(),
        lessonId: t.String(),
      }),
      headers: t.Object({
        authorization: t.String({ description: "Authorization token" }),
      }),
    },
  );
