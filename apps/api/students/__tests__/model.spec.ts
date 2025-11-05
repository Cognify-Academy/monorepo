import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import prisma from "../../prisma";
import {
  getProfile,
  getCourses,
  recordLessonProgress,
  getLessonProgress,
  getStudentProgress,
  getConceptsFromCompletedLessons,
} from "../model";

const testUser = {
  id: "user-123",
  username: "testuser",
  email: "test@example.com",
  name: "Test User",
  password: "hashedpassword",
  createdAt: "2025-03-17T15:52:12.689Z",
  updatedAt: "2025-03-17T15:52:12.689Z",
};

const mockFindUniqueUser = mock(() => ({
  id: "user-123",
  username: "testuser",
  email: "test@example.com",
  name: "Test User",
  password: "hashedpassword",
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));

const mockFindUniqueLesson = mock(() => ({
  id: "lesson-123",
  title: "Test Lesson",
  description: "This is a test lesson",
  order: 1,
  sectionId: "section-123",
  content: {},
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));

const mockUpsertLessonProgress = mock(() => ({
  id: "progress-123",
  userId: "user-123",
  lessonId: "lesson-123",
  completed: true,
  completedAt: new Date("2025-03-17T15:52:12.689Z"),
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));

const mockFindUniqueLessonProgress = mock(() => ({
  id: "progress-123",
  userId: "user-123",
  lessonId: "lesson-123",
  completed: true,
  completedAt: new Date("2025-03-17T15:52:12.689Z"),
  createdAt: new Date("2025-03-17T15:52:12.689Z"),
  updatedAt: new Date("2025-03-17T15:52:12.689Z"),
}));

const mockFindManyLessonProgress = mock(() => [
  {
    id: "progress-123",
    userId: "user-123",
    lessonId: "lesson-123",
    completed: true,
    completedAt: new Date("2025-03-17T15:52:12.689Z"),
    createdAt: new Date("2025-03-17T15:52:12.689Z"),
    updatedAt: new Date("2025-03-17T15:52:12.689Z"),
    lesson: {
      id: "lesson-123",
      title: "Test Lesson",
      description: "This is a test lesson",
      order: 1,
      sectionId: "section-123",
      content: {},
      createdAt: new Date("2025-03-17T15:52:12.689Z"),
      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
      section: {
        id: "section-123",
        title: "Test Section",
        description: "This is a test section",
        courseId: "course-123",
        order: 1,
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
        course: {
          id: "course-123",
          title: "Test Course",
          slug: "test-course",
          description: "This is a test course",
          published: true,
          userId: "user-123",
          createdAt: new Date("2025-03-17T15:52:12.689Z"),
          updatedAt: new Date("2025-03-17T15:52:12.689Z"),
        },
      },
    },
  },
]);

const mockFindManyCourses = mock(() => [
  {
    id: "course-123",
    title: "Test Course 1",
    description: "This is a test course",
    slug: "test-course-1",
    published: true,
    userId: "user-123",
    conceptCourses: [{ conceptId: "concept-1" }, { conceptId: "concept-2" }],
    createdAt: new Date("2025-03-17T15:52:12.689Z"),
    updatedAt: new Date("2025-03-17T15:52:12.689Z"),
  },
  {
    id: "course-456",
    title: "Test Course 2",
    description: "This is another test course",
    slug: "test-course-2",
    published: true,
    userId: "user-123",
    conceptCourses: [{ conceptId: "concept-3" }],
    createdAt: new Date("2025-03-17T15:52:12.689Z"),
    updatedAt: new Date("2025-03-17T15:52:12.689Z"),
  },
]);

prisma.user.findUnique = mockFindUniqueUser as any;
prisma.lesson.findUnique = mockFindUniqueLesson as any;
prisma.lessonProgress.upsert = mockUpsertLessonProgress as any;
prisma.lessonProgress.findUnique = mockFindUniqueLessonProgress as any;
prisma.lessonProgress.findMany = mockFindManyLessonProgress as any;
prisma.course.findMany = mockFindManyCourses as any;

afterEach(() => {
  jest.restoreAllMocks();
  mockFindUniqueUser.mockClear();
  mockFindUniqueLesson.mockClear();
  mockUpsertLessonProgress.mockClear();
  mockFindUniqueLessonProgress.mockClear();
  mockFindManyLessonProgress.mockClear();
  mockFindManyCourses.mockClear();
});

describe("Students", () => {
  describe("getProfile", () => {
    test("should return user profile when user exists", async () => {
      const result = await getProfile({ userId: "user-123" });

      expect(result).toEqual(testUser);

      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: {
          id: "user-123",
        },
      });
    });

    test("should return undefined timestamps when user not found", async () => {
      mockFindUniqueUser.mockImplementationOnce(() => null as any);

      const result = await getProfile({ userId: "nonexistent-user" });

      expect(result).toEqual({
        createdAt: undefined,
        updatedAt: undefined,
      });

      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: {
          id: "nonexistent-user",
        },
      });
    });

    test("should handle undefined userId", async () => {
      mockFindUniqueUser.mockImplementationOnce(() => null as any);
      const result = await getProfile({ userId: undefined });

      expect(result).toEqual({
        createdAt: undefined,
        updatedAt: undefined,
      });

      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: {
          id: undefined,
        },
      });
    });

    test("should handle empty parameters for getProfile", async () => {
      mockFindUniqueUser.mockImplementationOnce(() => null as any);
      const result = await getProfile();

      expect(result).toEqual({
        createdAt: undefined,
        updatedAt: undefined,
      });

      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: {
          id: undefined,
        },
      });
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database connection failed");
      mockFindUniqueUser.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(getProfile({ userId: "user-123" })).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  describe("getCourses", () => {
    test("should return all courses when no userId provided", async () => {
      const result = await getCourses();

      expect(result).toEqual([
        {
          id: "course-123",
          title: "Test Course 1",
          description: "This is a test course",
          slug: "test-course-1",
          published: true,
          userId: "user-123",
          conceptCourses: undefined,
          completed: false,
          enrollments: undefined,
          conceptIds: ["concept-1", "concept-2"],
          createdAt: "2025-03-17T15:52:12.689Z",
          updatedAt: "2025-03-17T15:52:12.689Z",
        },
        {
          id: "course-456",
          title: "Test Course 2",
          description: "This is another test course",
          slug: "test-course-2",
          published: true,
          userId: "user-123",
          conceptCourses: undefined,
          completed: false,
          enrollments: undefined,
          conceptIds: ["concept-3"],
          createdAt: "2025-03-17T15:52:12.689Z",
          updatedAt: "2025-03-17T15:52:12.689Z",
        },
      ]);

      expect(mockFindManyCourses).toHaveBeenCalledWith({
        where: {},
        include: {
          conceptCourses: {
            select: { conceptId: true },
          },
          enrollments: false,
        },
      });
    });

    test("should return empty array when no courses found", async () => {
      mockFindManyCourses.mockImplementationOnce(() => []);

      const result = await getCourses({ userId: "user-456" });

      expect(result).toEqual([]);
      expect(mockFindManyCourses).toHaveBeenCalledWith({
        where: {
          enrollments: { some: { userId: "user-456" } },
        },
        include: {
          conceptCourses: {
            select: { conceptId: true },
          },
          enrollments: {
            where: { userId: "user-456" },
            select: { completed: true },
          },
        },
      });
    });

    test("should handle undefined userId parameter", async () => {
      const result = await getCourses({ userId: undefined });

      expect(result).toHaveLength(2);
      expect(mockFindManyCourses).toHaveBeenCalledWith({
        where: {},
        include: {
          conceptCourses: {
            select: { conceptId: true },
          },
          enrollments: false,
        },
      });
    });

    test("should handle empty parameters for getCourses", async () => {
      const result = await getCourses();

      expect(result).toHaveLength(2);
      expect(mockFindManyCourses).toHaveBeenCalledWith({
        where: {},
        include: {
          conceptCourses: {
            select: { conceptId: true },
          },
          enrollments: false,
        },
      });
    });

    test("should throw error when database operation fails", async () => {
      const dbError = new Error("Database query failed");
      mockFindManyCourses.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(getCourses({ userId: "user-123" })).rejects.toThrow(
        "Database query failed",
      );
    });

    test("should transform date fields to ISO strings correctly", async () => {
      const customDate = new Date("2024-01-01T10:00:00.000Z");
      mockFindManyCourses.mockImplementationOnce(() => [
        {
          id: "course-789",
          title: "Custom Date Course",
          description: "Test course with custom dates",
          slug: "custom-date-course",
          published: false,
          userId: "user-456",
          conceptCourses: [{ conceptId: "concept-4" }],
          createdAt: customDate,
          updatedAt: customDate,
        },
      ]);

      const result = await getCourses();

      expect(result[0].createdAt).toBe("2024-01-01T10:00:00.000Z");
      expect(result[0].updatedAt).toBe("2024-01-01T10:00:00.000Z");
    });
  });

  describe("recordLessonProgress", () => {
    test("should record lesson progress successfully", async () => {
      const result = await recordLessonProgress({
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
      });

      expect(result).toEqual({
        id: "progress-123",
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        completedAt: "2025-03-17T15:52:12.689Z",
        createdAt: "2025-03-17T15:52:12.689Z",
        updatedAt: "2025-03-17T15:52:12.689Z",
      });

      expect(mockFindUniqueLesson).toHaveBeenCalledWith({
        where: { id: "lesson-123" },
      });

      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: { id: "user-123" },
      });

      expect(mockUpsertLessonProgress).toHaveBeenCalledWith({
        where: {
          userId_lessonId: {
            userId: "user-123",
            lessonId: "lesson-123",
          },
        },
        update: {
          completed: true,
          completedAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
        create: {
          userId: "user-123",
          lessonId: "lesson-123",
          completed: true,
          completedAt: expect.any(Date),
        },
      });
    });

    test("should handle lesson not found", async () => {
      mockFindUniqueLesson.mockImplementationOnce(() => null as any);

      await expect(
        recordLessonProgress({
          userId: "user-123",
          lessonId: "nonexistent-lesson",
          completed: true,
        }),
      ).rejects.toThrow("Lesson not found");

      expect(mockFindUniqueLesson).toHaveBeenCalledWith({
        where: { id: "nonexistent-lesson" },
      });
    });

    test("should handle user not found", async () => {
      mockFindUniqueUser.mockImplementationOnce(() => null as any);

      await expect(
        recordLessonProgress({
          userId: "nonexistent-user",
          lessonId: "lesson-123",
          completed: true,
        }),
      ).rejects.toThrow("User not found");

      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: { id: "nonexistent-user" },
      });
    });

    test("should handle completed: false", async () => {
      mockUpsertLessonProgress.mockImplementationOnce(() => ({
        id: "progress-123",
        userId: "user-123",
        lessonId: "lesson-123",
        completed: false,
        completedAt: null as any,
        createdAt: new Date("2025-03-17T15:52:12.689Z"),
        updatedAt: new Date("2025-03-17T15:52:12.689Z"),
      }));

      const result = await recordLessonProgress({
        userId: "user-123",
        lessonId: "lesson-123",
        completed: false,
      });

      expect(result.completed).toBe(false);
      expect(result.completedAt).toBeNull();

      expect(mockUpsertLessonProgress).toHaveBeenCalledWith({
        where: {
          userId_lessonId: {
            userId: "user-123",
            lessonId: "lesson-123",
          },
        },
        update: {
          completed: false,
          completedAt: null,
          updatedAt: expect.any(Date),
        },
        create: {
          userId: "user-123",
          lessonId: "lesson-123",
          completed: false,
          completedAt: null,
        },
      });
    });

    test("should handle database errors", async () => {
      const dbError = new Error("Database connection failed");
      mockFindUniqueLesson.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(
        recordLessonProgress({
          userId: "user-123",
          lessonId: "lesson-123",
          completed: true,
        }),
      ).rejects.toThrow("Database connection failed");
    });
  });

  describe("getLessonProgress", () => {
    test("should return lesson progress when found", async () => {
      const result = await getLessonProgress({
        userId: "user-123",
        lessonId: "lesson-123",
      });

      expect(result).toEqual({
        id: "progress-123",
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        completedAt: "2025-03-17T15:52:12.689Z",
        createdAt: "2025-03-17T15:52:12.689Z",
        updatedAt: "2025-03-17T15:52:12.689Z",
      });

      expect(mockFindUniqueLessonProgress).toHaveBeenCalledWith({
        where: {
          userId_lessonId: {
            userId: "user-123",
            lessonId: "lesson-123",
          },
        },
      });
    });

    test("should return null when progress not found", async () => {
      mockFindUniqueLessonProgress.mockImplementationOnce(() => null as any);

      const result = await getLessonProgress({
        userId: "user-123",
        lessonId: "lesson-456",
      });

      expect(result).toBeNull();
    });

    test("should handle database errors", async () => {
      const dbError = new Error("Database query failed");
      mockFindUniqueLessonProgress.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(
        getLessonProgress({
          userId: "user-123",
          lessonId: "lesson-123",
        }),
      ).rejects.toThrow("Database query failed");
    });
  });

  describe("getStudentProgress", () => {
    test("should return all progress for user", async () => {
      const result = await getStudentProgress({
        userId: "user-123",
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: "progress-123",
        userId: "user-123",
        lessonId: "lesson-123",
        completed: true,
        completedAt: "2025-03-17T15:52:12.689Z",
        createdAt: "2025-03-17T15:52:12.689Z",
        updatedAt: "2025-03-17T15:52:12.689Z",
        lesson: {
          id: "lesson-123",
          title: "Test Lesson",
          description: "This is a test lesson",
          order: 1,
          sectionId: "section-123",
          content: {},
          createdAt: "2025-03-17T15:52:12.689Z",
          updatedAt: "2025-03-17T15:52:12.689Z",
          section: {
            id: "section-123",
            title: "Test Section",
            description: "This is a test section",
            courseId: "course-123",
            order: 1,
            createdAt: "2025-03-17T15:52:12.689Z",
            updatedAt: "2025-03-17T15:52:12.689Z",
            course: {
              id: "course-123",
              title: "Test Course",
              slug: "test-course",
              description: "This is a test course",
              published: true,
              userId: "user-123",
              createdAt: "2025-03-17T15:52:12.689Z",
              updatedAt: "2025-03-17T15:52:12.689Z",
            },
          },
        },
      });

      expect(mockFindManyLessonProgress).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        include: {
          lesson: {
            include: {
              section: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });
    });

    test("should filter by courseId when provided", async () => {
      const result = await getStudentProgress({
        userId: "user-123",
        courseId: "course-123",
      });

      expect(result).toHaveLength(1);
      expect(mockFindManyLessonProgress).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          lesson: {
            section: {
              courseId: "course-123",
            },
          },
        },
        include: {
          lesson: {
            include: {
              section: {
                include: {
                  course: true,
                },
              },
            },
          },
        },
      });
    });

    test("should return empty array when no progress found", async () => {
      mockFindManyLessonProgress.mockImplementationOnce(() => []);

      const result = await getStudentProgress({
        userId: "user-456",
      });

      expect(result).toEqual([]);
    });

    test("should handle database errors", async () => {
      const dbError = new Error("Database query failed");
      mockFindManyLessonProgress.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(
        getStudentProgress({
          userId: "user-123",
        }),
      ).rejects.toThrow("Database query failed");
    });
  });

  describe("getConceptsFromCompletedLessons", () => {
    test("should return concepts from completed lessons", async () => {
      mockFindManyLessonProgress.mockImplementationOnce(
        () =>
          [
            {
              id: "progress-123",
              userId: "user-123",
              lessonId: "lesson-123",
              completed: true,
              completedAt: new Date("2025-03-17T15:52:12.689Z"),
              createdAt: new Date("2025-03-17T15:52:12.689Z"),
              updatedAt: new Date("2025-03-17T15:52:12.689Z"),
              lesson: {
                id: "lesson-123",
                title: "Test Lesson",
                description: "This is a test lesson",
                order: 1,
                sectionId: "section-123",
                content: {},
                createdAt: new Date("2025-03-17T15:52:12.689Z"),
                updatedAt: new Date("2025-03-17T15:52:12.689Z"),
                ConceptLesson: [
                  {
                    conceptId: "concept-1",
                    lessonId: "lesson-123",
                    concept: {
                      id: "concept-1",
                      name: "Test Concept",
                      slug: "test-concept",
                      createdAt: new Date("2025-03-17T15:52:12.689Z"),
                      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
                      conceptSource: [],
                      conceptTarget: [],
                    },
                  },
                  {
                    conceptId: "concept-2",
                    lessonId: "lesson-123",
                    concept: {
                      id: "concept-2",
                      name: "Test Concept 2",
                      slug: "test-concept-2",
                      createdAt: new Date("2025-03-17T15:52:12.689Z"),
                      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
                      conceptSource: [],
                      conceptTarget: [],
                    },
                  },
                ],
              } as any,
            },
          ] as any,
      );
      const result = await getConceptsFromCompletedLessons({
        userId: "user-123",
      });

      expect(result).toEqual([
        {
          id: "concept-1",
          name: "Test Concept",
          slug: "test-concept",
          createdAt: "2025-03-17T15:52:12.689Z",
          updatedAt: "2025-03-17T15:52:12.689Z",
          conceptSource: [],
          conceptTarget: [],
          completedLessons: [
            {
              lessonId: "lesson-123",
              lessonTitle: "Test Lesson",
              completedAt: "2025-03-17T15:52:12.689Z",
            },
          ],
        },
        {
          id: "concept-2",
          name: "Test Concept 2",
          slug: "test-concept-2",
          createdAt: "2025-03-17T15:52:12.689Z",
          updatedAt: "2025-03-17T15:52:12.689Z",
          conceptSource: [],
          conceptTarget: [],
          completedLessons: [
            {
              lessonId: "lesson-123",
              lessonTitle: "Test Lesson",
              completedAt: "2025-03-17T15:52:12.689Z",
            },
          ],
        },
      ]);
    });

    test("should return empty array when no lessons found", async () => {
      mockFindManyLessonProgress.mockImplementationOnce(() => []);

      const result = await getConceptsFromCompletedLessons({
        userId: "user-123",
      });

      expect(result).toEqual([]);
    });

    test("should handle database errors", async () => {
      const dbError = new Error("Database query failed");
      mockFindManyLessonProgress.mockImplementationOnce(() => {
        throw dbError;
      });

      await expect(
        getConceptsFromCompletedLessons({
          userId: "user-123",
        }),
      ).rejects.toThrow("Database query failed");
    });

    test("should deduplicate concepts from multiple lessons", async () => {
      mockFindManyLessonProgress.mockImplementationOnce(
        () =>
          [
            {
              id: "progress-123",
              userId: "user-123",
              lessonId: "lesson-123",
              completed: true,
              completedAt: new Date("2025-03-17T15:52:12.689Z"),
              createdAt: new Date("2025-03-17T15:52:12.689Z"),
              updatedAt: new Date("2025-03-17T15:52:12.689Z"),
              lesson: {
                id: "lesson-123",
                title: "Test Lesson 1",
                ConceptLesson: [
                  {
                    conceptId: "concept-1",
                    lessonId: "lesson-123",
                    concept: {
                      id: "concept-1",
                      name: "Test Concept",
                      slug: "test-concept",
                      createdAt: new Date("2025-03-17T15:52:12.689Z"),
                      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
                      conceptSource: [],
                      conceptTarget: [],
                    },
                  },
                ],
              } as any,
            },
            {
              id: "progress-456",
              userId: "user-123",
              lessonId: "lesson-456",
              completed: true,
              completedAt: new Date("2025-03-18T10:30:00.000Z"),
              createdAt: new Date("2025-03-18T10:30:00.000Z"),
              updatedAt: new Date("2025-03-18T10:30:00.000Z"),
              lesson: {
                id: "lesson-456",
                title: "Test Lesson 2",
                ConceptLesson: [
                  {
                    conceptId: "concept-1",
                    lessonId: "lesson-456",
                    concept: {
                      id: "concept-1",
                      name: "Test Concept",
                      slug: "test-concept",
                      createdAt: new Date("2025-03-17T15:52:12.689Z"),
                      updatedAt: new Date("2025-03-17T15:52:12.689Z"),
                      conceptSource: [],
                      conceptTarget: [],
                    },
                  },
                ],
              } as any,
            },
          ] as any,
      );

      const result = await getConceptsFromCompletedLessons({
        userId: "user-123",
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("concept-1");
      expect(result[0].completedLessons).toHaveLength(2);
      expect(result[0].completedLessons).toEqual([
        {
          lessonId: "lesson-123",
          lessonTitle: "Test Lesson 1",
          completedAt: "2025-03-17T15:52:12.689Z",
        },
        {
          lessonId: "lesson-456",
          lessonTitle: "Test Lesson 2",
          completedAt: "2025-03-18T10:30:00.000Z",
        },
      ]);
    });

    test("should query with correct parameters", async () => {
      mockFindManyLessonProgress.mockImplementationOnce(() => []);

      await getConceptsFromCompletedLessons({
        userId: "user-123",
      });

      expect(mockFindManyLessonProgress).toHaveBeenCalledWith({
        where: {
          userId: "user-123",
          completed: true,
        },
        include: {
          lesson: {
            include: {
              ConceptLesson: {
                include: {
                  concept: {
                    include: {
                      conceptSource: true,
                      conceptTarget: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
  });
});
