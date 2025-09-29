import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import prisma from "../../prisma";
import { getCourses, getCourse, enrolStudent } from "../model";

const mockFindManyCourses = mock(() => [
  {
    id: "course-123",
    title: "Test Course 1",
    description: "This is a test course",
    slug: "test-course-1",
    published: true,
    userId: "user-123",
    createdAt: new Date("2025-03-17T15:52:12.689Z"),
    updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    conceptCourses: [{ conceptId: "concept-1" }, { conceptId: "concept-2" }],
    instructors: [
      {
        id: "instructor-1",
        courseId: "course-123",
        userId: "instructor-1",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
      },
    ],
  },
  {
    id: "course-456",
    title: "Test Course 2",
    description: "This is another test course",
    slug: "test-course-2",
    published: true,
    userId: "user-123",
    createdAt: new Date("2025-03-17T15:52:12.689Z"),
    updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    conceptCourses: [{ conceptId: "concept-3" }],
    instructors: [
      {
        id: "instructor-2",
        courseId: "course-456",
        userId: "instructor-2",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
      },
    ],
  },
]);

const mockFindFirstCourse = mock(() => ({
  id: "course-123",
  title: "Test Course 1",
  description: "This is a test course",
  slug: "test-course-1",
  published: true,
  userId: "user-123",
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
  conceptCourses: [{ conceptId: "concept-1" }, { conceptId: "concept-2" }],
  instructors: [
    {
      id: "instructor-1",
      courseId: "course-123",
      userId: "instructor-1",
      createdAt: new Date("2025-03-17T15:52:12.689Z"),
    },
  ],
  sections: [
    {
      id: "section-1",
      title: "Section 1",
      description: "First section",
      order: 1,
      ConceptSection: [{ concept: { id: "concept-1" } }],
      lessons: [
        {
          id: "lesson-1",
          title: "Lesson 1",
          description: "First lesson",
          content: { blocks: [] },
          order: 1,
          ConceptLesson: [{ concept: { id: "concept-1" } }],
        },
        {
          id: "lesson-2",
          title: "Lesson 2",
          description: "Second lesson",
          content: { blocks: [] },
          order: 2,
          ConceptLesson: [{ concept: { id: "concept-2" } }],
        },
      ],
    },
  ],
}));

const mockFindFirstEnrollment = mock(() => null);

const mockCreateEnrollment = mock(() => ({
  id: "enrollment-123",
  userId: "user-456",
  courseId: "course-123",
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
}));

prisma.course.findMany = mockFindManyCourses as any;
prisma.course.findFirst = mockFindFirstCourse as any;
prisma.enrollment.findFirst = mockFindFirstEnrollment as any;
prisma.enrollment.create = mockCreateEnrollment as any;

afterEach(() => {
  jest.restoreAllMocks();
  mockFindManyCourses.mockClear();
  mockFindFirstCourse.mockClear();
  mockFindFirstEnrollment.mockClear();
  mockCreateEnrollment.mockClear();
});

describe("Courses", () => {
  describe("getCourses", () => {
    test("should return all courses with transformed concept data", async () => {
      const result = await getCourses();

      expect(result).toEqual([
        {
          id: "course-123",
          title: "Test Course 1",
          description: "This is a test course",
          slug: "test-course-1",
          published: true,
          userId: "user-123",
          createdAt: new Date("2025-03-17T15:52:12.689Z"),
          updatedAt: new Date("2025-03-17T15:52:12.689Z"),
          conceptIds: ["concept-1", "concept-2"],
          conceptCourses: undefined,
          instructors: [
            {
              id: "instructor-1",
              courseId: "course-123",
              userId: "instructor-1",
              createdAt: new Date("2025-03-17T15:52:12.689Z"),
            },
          ],
        },
        {
          id: "course-456",
          title: "Test Course 2",
          description: "This is another test course",
          slug: "test-course-2",
          published: true,
          userId: "user-123",
          createdAt: new Date("2025-03-17T15:52:12.689Z"),
          updatedAt: new Date("2025-03-17T15:52:12.689Z"),
          conceptIds: ["concept-3"],
          conceptCourses: undefined,
          instructors: [
            {
              id: "instructor-2",
              courseId: "course-456",
              userId: "instructor-2",
              createdAt: new Date("2025-03-17T15:52:12.689Z"),
            },
          ],
        },
      ]);

      expect(mockFindManyCourses).toHaveBeenCalledWith({
        include: {
          conceptCourses: {
            select: { conceptId: true },
          },
          instructors: true,
        },
      });
    });

    test("should return empty array when no courses found", async () => {
      mockFindManyCourses.mockImplementationOnce(() => []);

      const result = await getCourses();

      expect(result).toEqual([]);
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database query failed");
      mockFindManyCourses.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(getCourses()).rejects.toThrow("Database query failed");
    });
  });

  describe("getCourse", () => {
    test("should return course by id with transformed data", async () => {
      const result = await getCourse("course-123");

      expect(result).toEqual({
        id: "course-123",
        title: "Test Course 1",
        description: "This is a test course",
        slug: "test-course-1",
        published: true,
        userId: "user-123",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
        conceptIds: ["concept-1", "concept-2"],
        instructors: [
          {
            id: "instructor-1",
            courseId: "course-123",
            userId: "instructor-1",
            createdAt: new Date("2025-03-17T15:52:12.689Z"),
          },
        ],
        sections: [
          {
            id: "section-1",
            title: "Section 1",
            description: "First section",
            order: 1,
            conceptIds: ["concept-1"],
            lessons: [
              {
                id: "lesson-1",
                title: "Lesson 1",
                description: "First lesson",
                content: { blocks: [] },
                order: 1,
                conceptIds: ["concept-1"],
                media: [],
              },
              {
                id: "lesson-2",
                title: "Lesson 2",
                description: "Second lesson",
                content: { blocks: [] },
                order: 2,
                conceptIds: ["concept-2"],
                media: [],
              },
            ],
          },
        ],
      });

      expect(mockFindFirstCourse).toHaveBeenCalledWith({
        where: {
          OR: [{ id: "course-123" }, { slug: "course-123" }],
        },
        include: {
          conceptCourses: {
            select: { conceptId: true },
          },
          instructors: true,
          sections: {
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              order: true,
              ConceptSection: {
                select: {
                  concept: {
                    select: { id: true },
                  },
                },
              },
              lessons: {
                orderBy: { order: "asc" },
                select: {
                  id: true,
                  order: true,
                  title: true,
                  content: true,
                  description: true,
                  ConceptLesson: {
                    select: {
                      concept: {
                        select: { id: true },
                      },
                    },
                  },
                  media: {
                    select: {
                      id: true,
                      title: true,
                      description: true,
                      mediaType: true,
                      content: true,
                      url: true,
                      notes: true,
                      transcript: true,
                      metadata: true,
                      createdAt: true,
                      updatedAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });

    test("should return course by slug", async () => {
      const result = await getCourse("test-course-1");

      expect(result).toBeDefined();
      expect(mockFindFirstCourse).toHaveBeenCalledWith({
        where: {
          OR: [{ id: "test-course-1" }, { slug: "test-course-1" }],
        },
        include: expect.any(Object),
      });
    });

    test("should return null when course not found", async () => {
      mockFindFirstCourse.mockImplementationOnce(() => null as any);

      const result = await getCourse("nonexistent-course");

      expect(result).toBeNull();
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database query failed");
      mockFindFirstCourse.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(getCourse("course-123")).rejects.toThrow(
        "Database query failed",
      );
    });

    test("should handle course with empty sections", async () => {
      mockFindFirstCourse.mockImplementationOnce(() => ({
        id: "course-empty",
        title: "Empty Course",
        description: "Course with no sections",
        slug: "empty-course",
        published: false,
        userId: "user-123",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
        conceptCourses: [],
        instructors: [],
        sections: [],
      }));

      const result = await getCourse("empty-course");

      expect(result).toEqual({
        id: "course-empty",
        title: "Empty Course",
        description: "Course with no sections",
        slug: "empty-course",
        published: false,
        userId: "user-123",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
        conceptIds: [],
        instructors: [],
        sections: [],
      });
    });

    test("should map lesson media correctly", async () => {
      const createdAt = new Date("2025-03-17T15:52:12.689Z");
      const updatedAt = new Date("2025-03-18T10:00:00.000Z");

      mockFindFirstCourse.mockImplementationOnce(() => ({
        id: "course-with-media",
        title: "Course With Media",
        description: "Includes lesson media",
        slug: "course-with-media",
        published: true,
        userId: "user-123",
        createdAt,
        updatedAt,
        conceptCourses: [{ conceptId: "concept-1" }],
        instructors: [],
        sections: [
          {
            id: "section-1",
            title: "Section 1",
            description: "First section",
            order: 1,
            ConceptSection: [{ concept: { id: "concept-1" } }],
            lessons: [
              {
                id: "lesson-1",
                title: "Lesson 1",
                description: "First lesson",
                content: { blocks: [] },
                order: 1,
                ConceptLesson: [{ concept: { id: "concept-1" } }],
                media: [
                  {
                    id: "media-1",
                    title: "An Article",
                    description: "Useful reading",
                    mediaType: "ARTICLE",
                    content: "# Hello",
                    url: "https://example.com/article",
                    notes: "Read carefully",
                    transcript: null,
                    metadata: { author: "Author Name" },
                    createdAt,
                    updatedAt,
                  },
                ],
              },
            ],
          },
        ],
      }));

      const result = await getCourse("course-with-media");

      expect(result).toBeDefined();
      expect(result?.sections[0].lessons[0].media).toEqual([
        {
          id: "media-1",
          title: "An Article",
          description: "Useful reading",
          mediaType: "ARTICLE",
          content: "# Hello",
          url: "https://example.com/article",
          notes: "Read carefully",
          transcript: undefined,
          metadata: { author: "Author Name" },
          createdAt: createdAt.toISOString(),
          updatedAt: updatedAt.toISOString(),
        },
      ]);

      expect(mockFindFirstCourse).toHaveBeenCalledWith({
        where: {
          OR: [{ id: "course-with-media" }, { slug: "course-with-media" }],
        },
        include: expect.any(Object),
      });
    });
  });

  describe("enrolStudent", () => {
    test("should enroll student successfully", async () => {
      const result = await enrolStudent({
        identifier: "course-123",
        userId: "user-456",
      });

      expect(result).toEqual({
        id: "enrollment-123",
        userId: "user-456",
        courseId: "course-123",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
      });

      expect(mockFindFirstCourse).toHaveBeenCalledWith({
        where: {
          OR: [{ id: "course-123" }, { slug: "course-123" }],
        },
      });

      expect(mockFindFirstEnrollment).toHaveBeenCalledWith({
        where: {
          courseId: "course-123",
          userId: "user-456",
        },
      });

      expect(mockCreateEnrollment).toHaveBeenCalledWith({
        data: {
          courseId: "course-123",
          userId: "user-456",
        },
      });
    });

    test("should enroll student by course slug", async () => {
      const result = await enrolStudent({
        identifier: "test-course-1",
        userId: "user-456",
      });

      expect(result).toBeDefined();
      expect(mockFindFirstCourse).toHaveBeenCalledWith({
        where: {
          OR: [{ id: "test-course-1" }, { slug: "test-course-1" }],
        },
      });
    });

    test("should throw error when course not found", async () => {
      mockFindFirstCourse.mockImplementationOnce(() => null as any);

      await expect(
        enrolStudent({
          identifier: "nonexistent-course",
          userId: "user-456",
        }),
      ).rejects.toThrow("Course not found");
    });

    test("should throw error when user already enrolled", async () => {
      mockFindFirstEnrollment.mockImplementationOnce(
        () =>
          ({
            id: "existing-enrollment",
            userId: "user-456",
            courseId: "course-123",
            createdAt: new Date(),
          }) as any,
      );

      await expect(
        enrolStudent({
          identifier: "course-123",
          userId: "user-456",
        }),
      ).rejects.toThrow("User already enrolled in this course");
    });

    test("should throw error when enrollment creation fails", async () => {
      const dbError = new Error("Enrollment creation failed");
      mockCreateEnrollment.mockImplementationOnce(() => {
        throw dbError;
      });

      expect(
        enrolStudent({
          identifier: "course-123",
          userId: "user-456",
        }),
      ).rejects.toThrow("Enrollment creation failed");
    });

    test("should rethrow specific errors as-is", async () => {
      mockFindFirstCourse.mockImplementationOnce(() => null as any);

      expect(
        enrolStudent({
          identifier: "course-123",
          userId: "user-456",
        }),
      ).rejects.toThrow("Course not found");

      mockFindFirstCourse.mockClear();
      mockFindFirstCourse.mockImplementation(() => ({
        id: "course-123",
        title: "Test Course",
        description: "Test description",
        slug: "test-course",
        published: true,
        userId: "user-123",
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
        conceptCourses: [],
        instructors: [],
        sections: [],
      }));

      mockFindFirstEnrollment.mockImplementationOnce(
        () =>
          ({
            id: "existing",
            userId: "user-456",
            courseId: "course-123",
            createdAt: new Date(),
          }) as any,
      );

      expect(
        enrolStudent({
          identifier: "course-123",
          userId: "user-456",
        }),
      ).rejects.toThrow("User already enrolled in this course");
    });

    test("should handle database errors during enrollment check", async () => {
      const dbError = new Error("Database connection failed");
      mockFindFirstEnrollment.mockImplementationOnce(() => {
        throw dbError;
      });

      expect(
        enrolStudent({
          identifier: "course-123",
          userId: "user-456",
        }),
      ).rejects.toThrow("Database connection failed");
    });
  });
});
