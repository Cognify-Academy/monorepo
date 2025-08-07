import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import prisma from "../../prisma";

import {
  createCourse,
  updateCourse,
  getCourses,
  getCourse,
  createSection,
  updateSection,
  updateCourseSectionOrder,
  updateCourseLessonOrder,
  createLesson,
  updateLesson,
  deleteSection,
  deleteLesson,
  createMedia,
  updateMedia,
  getMedia,
  getAllMedia,
  deleteMedia,
} from "../model";

afterEach(() => {
  jest.restoreAllMocks();
});

describe("Course Management", () => {
  describe("createCourse", () => {
    test("should create a new course with valid values", async () => {
      const resolvedValue = {
        id: "test-course-id",
        title: "Test Course",
        slug: "test-course",
        description: "This is a test course",
        userId: "test-user-id",
        conceptIds: ["concept-id-1", "concept-id-2"],
        published: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        conceptCourses: [
          { conceptId: "concept-id-1" },
          { conceptId: "concept-id-2" },
        ],
      };
      prisma.course.create = jest.fn().mockResolvedValue(resolvedValue);
      prisma.courseInstructor.create = jest.fn().mockResolvedValue({});

      const course = await createCourse({
        title: "Test Course",
        description: "This is a test course",
        userId: "test-user-id",
        conceptIds: ["concept-id-1", "concept-id-2"],
      });

      expect(course).toEqual(resolvedValue);
      expect(prisma.course.create).toHaveBeenCalledWith({
        data: {
          title: "Test Course",
          slug: "test-course",
          description: "This is a test course",
          userId: "test-user-id",
          published: false,
          conceptCourses: {
            create: [
              { concept: { connect: { id: "concept-id-1" } } },
              { concept: { connect: { id: "concept-id-2" } } },
            ],
          },
        },
        include: {
          conceptCourses: {
            select: { conceptId: true },
          },
        },
      });
      expect(prisma.courseInstructor.create).toHaveBeenCalledWith({
        data: {
          userId: "test-user-id",
          courseId: "test-course-id",
        },
      });
    });
  });

  describe("updateCourse", () => {
    test("should update course with all fields", async () => {
      const mockCourse = {
        id: "test-course-id",
        userId: "test-user-id",
        instructors: [{ userId: "test-user-id" }],
      };
      const updatedCourse = {
        id: "test-course-id",
        title: "Updated Course",
        slug: "updated-course",
        description: "Updated description",
        published: true,
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(mockCourse);
      prisma.course.update = jest.fn().mockResolvedValue(updatedCourse);
      prisma.conceptCourse.deleteMany = jest.fn().mockResolvedValue({});
      prisma.conceptCourse.createMany = jest.fn().mockResolvedValue({});

      const result = await updateCourse({
        id: "test-course-id",
        title: "Updated Course",
        description: "Updated description",
        published: true,
        conceptIds: ["concept-1", "concept-2"],
        userId: "test-user-id",
      });

      expect(result).toEqual(updatedCourse);
      expect(prisma.course.update).toHaveBeenCalledWith({
        where: { id: "test-course-id" },
        data: {
          title: "Updated Course",
          description: "Updated description",
          published: true,
        },
      });
      expect(prisma.conceptCourse.deleteMany).toHaveBeenCalledWith({
        where: { courseId: "test-course-id" },
      });
      expect(prisma.conceptCourse.createMany).toHaveBeenCalledWith({
        data: [
          { courseId: "test-course-id", conceptId: "concept-1" },
          { courseId: "test-course-id", conceptId: "concept-2" },
        ],
      });
    });

    test("should throw an error if the user is not an instructor", async () => {
      const mockCourse = {
        id: "test-course-id",
        instructors: [{ userId: "other-user-id" }],
      };
      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(mockCourse);
      await expect(
        updateCourse({
          id: "test-course-id",
          title: "Attempted Update",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to update this course");
    });

    test("should throw error for invalid course or user", async () => {
      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(null);

      await expect(
        updateCourse({
          id: "invalid-course-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Invalid course or user");
    });
  });

  describe("getCourses", () => {
    test("should return courses for user", async () => {
      const mockCourses = [
        {
          id: "course-1",
          title: "Course 1",
          description: "Description 1",
          userId: "test-user-id",
          conceptCourses: [
            { conceptId: "concept-1" },
            { conceptId: "concept-2" },
          ],
          instructors: [{ userId: "test-user-id" }],
        },
        {
          id: "course-2",
          title: "Course 2",
          description: "Description 2",
          userId: "other-user-id",
          conceptCourses: [{ conceptId: "concept-3" }],
          instructors: [{ userId: "test-user-id" }],
        },
      ];

      prisma.course.findMany = jest.fn().mockResolvedValue(mockCourses);

      const courses = await getCourses("test-user-id");

      expect(courses).toHaveLength(2);
      expect(courses[0]).toHaveProperty("conceptIds", [
        "concept-1",
        "concept-2",
      ]);
      expect(courses[1]).toHaveProperty("conceptIds", ["concept-3"]);
      expect(courses[0].conceptCourses).toBeUndefined();
    });
  });

  describe("getCourse", () => {
    test("should return course by id with sections and lessons", async () => {
      const mockCourse = {
        id: "test-course-id",
        title: "Test Course",
        conceptCourses: [{ conceptId: "concept-1" }],
        instructors: [{ userId: "test-user-id" }],
        sections: [
          {
            id: "section-1",
            title: "Section 1",
            description: "Section description",
            order: 1,
            ConceptSection: [{ concept: { id: "concept-1" } }],
            lessons: [
              {
                id: "lesson-1",
                title: "Lesson 1",
                content: "Lesson content",
                description: "Lesson description",
                order: 1,
                ConceptLesson: [{ concept: { id: "concept-2" } }],
                media: [],
              },
            ],
          },
        ],
      };

      prisma.course.findFirst = jest.fn().mockResolvedValue(mockCourse);

      const course = await getCourse("test-course-id");

      expect(course).toBeDefined();
      expect(course?.conceptIds).toEqual(["concept-1"]);
      expect(course?.sections).toHaveLength(1);
      expect(course?.sections[0].conceptIds).toEqual(["concept-1"]);
      expect(course?.sections[0].lessons[0].conceptIds).toEqual(["concept-2"]);
      expect(course?.sections[0]).not.toHaveProperty("ConceptSection");
    });

    test("should return null for non-existent course", async () => {
      prisma.course.findFirst = jest.fn().mockResolvedValue(null);

      const course = await getCourse("non-existent-id");

      expect(course).toBeNull();
    });
  });
});

describe("Section Management", () => {
  describe("createSection", () => {
    test("should create a new section", async () => {
      const mockCourse = {
        id: "course-id",
        userId: "test-user-id",
        sections: [],
        instructors: [{ userId: "test-user-id" }],
      };
      const mockSection = {
        id: "section-id",
        title: "Test Section",
        description: "Section description",
        courseId: "course-id",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(mockCourse);
      prisma.section.create = jest.fn().mockResolvedValue(mockSection);

      const section = await createSection({
        id: "course-id",
        title: "Test Section",
        description: "Section description",
        conceptIds: ["concept-1", "concept-2"],
        userId: "test-user-id",
      });

      expect(section).toEqual(mockSection);
      expect(prisma.section.create).toHaveBeenCalledWith({
        data: {
          title: "Test Section",
          description: "Section description",
          order: 0,
          course: { connect: { id: "course-id" } },
          ConceptSection: {
            create: [
              { concept: { connect: { id: "concept-1" } } },
              { concept: { connect: { id: "concept-2" } } },
            ],
          },
        },
      });
    });

    test("should throw an error if user is not an instructor", async () => {
      const mockCourse = {
        id: "course-id",
        instructors: [{ userId: "other-user-id" }],
        sections: [],
      };
      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(mockCourse);
      await expect(
        createSection({
          id: "course-id",
          title: "Test Section",
          description: "Section description",
          conceptIds: [],
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to create a section for this course");
    });

    test("should throw error for invalid course or user", async () => {
      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(null);

      await expect(
        createSection({
          id: "invalid-course-id",
          title: "Test Section",
          description: "Section description",
          conceptIds: [],
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Invalid course or user");
    });
  });

  describe("updateSection", () => {
    test("should update section with all fields", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "test-user-id" }],
        },
      };
      const updatedSection = {
        id: "section-id",
        title: "Updated Section",
        description: "Updated description",
        courseId: "course-id",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.section.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockSection);
      prisma.section.update = jest.fn().mockResolvedValue(updatedSection);
      prisma.conceptSection.deleteMany = jest.fn().mockResolvedValue({});
      prisma.conceptSection.createMany = jest.fn().mockResolvedValue({});

      const result = await updateSection({
        id: "section-id",
        title: "Updated Section",
        description: "Updated description",
        conceptIds: ["concept-1"],
        userId: "test-user-id",
      });

      expect(result).toEqual(updatedSection);
      expect(prisma.section.update).toHaveBeenCalledWith({
        where: { id: "section-id" },
        data: {
          title: "Updated Section",
          description: "Updated description",
        },
      });
    });

    test("should throw an error if user is not an instructor", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "other-user-id" }],
        },
      };
      prisma.section.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockSection);
      await expect(
        updateSection({
          id: "section-id",
          title: "Updated Section",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to update this section");
    });
  });

  describe("updateCourseSectionOrder", () => {
    test("should update section order", async () => {
      const mockUpdates = [
        { id: "section-1", order: 1 },
        { id: "section-2", order: 2 },
      ];

      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue({
        instructors: [{ userId: "test-user-id" }],
      });
      prisma.section.update = jest
        .fn()
        .mockImplementation(({ where, data }) =>
          Promise.resolve({ id: where.id, order: data.order }),
        );

      const result = await updateCourseSectionOrder({
        userId: "test-user-id",
        id: "course-id",
        order: mockUpdates,
      });

      expect(result).toHaveLength(2);
      expect(prisma.section.update).toHaveBeenCalledTimes(2);
    });

    test("should throw an error if user is not an instructor", async () => {
      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue({
        instructors: [{ userId: "other-user-id" }],
      });
      await expect(
        updateCourseSectionOrder({
          userId: "test-user-id",
          id: "course-id",
          order: [],
        }),
      ).rejects.toThrow("Unauthorized to update sections for this course");
    });
  });

  describe("updateCourseLessonOrder", () => {
    test("should update lesson order", async () => {
      const mockCourse = {
        id: "course-id",
        sections: [{ id: "section-id" }],
        instructors: [{ userId: "test-user-id" }],
      };
      const ordering = [
        { id: "lesson-1", sectionId: "section-id", order: 1 },
        { id: "lesson-2", sectionId: "section-id", order: 2 },
      ];

      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(mockCourse);
      prisma.lesson.update = jest
        .fn()
        .mockImplementation(({ where, data }) =>
          Promise.resolve({ id: where.id, ...data }),
        );

      const result = await updateCourseLessonOrder({
        userId: "test-user-id",
        courseId: "course-id",
        ordering,
      });

      expect(result).toHaveLength(2);
      expect(prisma.lesson.update).toHaveBeenCalledTimes(2);
    });

    test("should throw an error if user is not an instructor", async () => {
      const mockCourse = {
        id: "course-id",
        instructors: [{ userId: "other-user-id" }],
      };
      prisma.course.findUniqueOrThrow = jest.fn().mockResolvedValue(mockCourse);
      await expect(
        updateCourseLessonOrder({
          userId: "test-user-id",
          courseId: "course-id",
          ordering: [],
        }),
      ).rejects.toThrow("Unauthorized to update lesson order for this course");
    });
  });

  describe("deleteSection", () => {
    test("should delete section without lessons", async () => {
      const mockSection = {
        id: "section-id",
        title: "Test Section",
        description: "Section description",
        courseId: "course-id",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        course: {
          instructors: [{ userId: "test-user-id" }],
        },
        lessons: [],
      };

      prisma.section.findUnique = jest.fn().mockResolvedValue(mockSection);
      prisma.section.delete = jest.fn().mockResolvedValue(mockSection);

      const result = await deleteSection({
        id: "section-id",
        userId: "test-user-id",
      });

      expect(result).toEqual(mockSection);
      expect(prisma.section.delete).toHaveBeenCalledWith({
        where: { id: "section-id" },
      });
    });

    test("should throw an error if user is not an instructor", async () => {
      const mockSection = {
        id: "section-id",
        lessons: [],
        course: {
          instructors: [{ userId: "other-user-id" }],
        },
      };
      prisma.section.findUnique = jest.fn().mockResolvedValue(mockSection);
      await expect(
        deleteSection({
          id: "section-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to delete this section");
    });

    test("should throw error when section has lessons", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "test-user-id" }],
        },
        lessons: [{ id: "lesson-1" }],
      };

      prisma.section.findUnique = jest.fn().mockResolvedValue(mockSection);

      await expect(
        deleteSection({
          id: "section-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Cannot delete section with lessons");
    });

    test("should throw error when section not found", async () => {
      prisma.section.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        deleteSection({
          id: "non-existent-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Section not found");
    });
  });
});

describe("Lesson Management", () => {
  describe("createLesson", () => {
    test("should create a new lesson", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "test-user-id" }],
        },
      };
      const mockLesson = {
        id: "lesson-id",
        title: "Test Lesson",
        description: "Lesson description",
        content: "Lesson content",
        sectionId: "section-id",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.section.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockSection);
      prisma.lesson.create = jest.fn().mockResolvedValue(mockLesson);

      const lesson = await createLesson({
        sectionId: "section-id",
        title: "Test Lesson",
        description: "Lesson description",
        content: "Lesson content",
        conceptIds: ["concept-1", "concept-2"],
        userId: "test-user-id",
      });

      expect(lesson).toEqual(mockLesson);
    });

    test("should throw error for unauthorized user", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "other-user-id" }],
        },
      };

      prisma.section.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockSection);

      await expect(
        createLesson({
          sectionId: "section-id",
          title: "Test Lesson",
          description: "Lesson description",
          content: "Lesson content",
          conceptIds: [],
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to create a lesson for this course");
    });
  });

  describe("updateLesson", () => {
    test("should update lesson with all fields", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "test-user-id" }],
        },
      };
      const updatedLesson = {
        id: "lesson-id",
        title: "Updated Lesson",
        description: "Updated description",
        content: "Updated content",
        sectionId: "section-id",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.section.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockSection);
      prisma.lesson.update = jest.fn().mockResolvedValue(updatedLesson);
      prisma.conceptLesson.deleteMany = jest.fn().mockResolvedValue({});
      prisma.conceptLesson.createMany = jest.fn().mockResolvedValue({});

      const result = await updateLesson({
        lessonId: "lesson-id",
        sectionId: "section-id",
        updates: {
          title: "Updated Lesson",
          description: "Updated description",
          content: "Updated content",
          conceptIds: ["concept-1"],
        },
        userId: "test-user-id",
      });

      expect(result).toEqual(updatedLesson);
      expect(prisma.lesson.update).toHaveBeenCalledWith({
        where: { id: "lesson-id", sectionId: "section-id" },
        data: {
          title: "Updated Lesson",
          description: "Updated description",
          content: "Updated content",
        },
      });
    });

    test("should throw an error if the user is not an instructor", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "other-user-id" }],
        },
      };
      prisma.section.findUniqueOrThrow = jest
        .fn()
        .mockResolvedValue(mockSection);
      await expect(
        updateLesson({
          lessonId: "lesson-id",
          sectionId: "section-id",
          updates: {},
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to update this lesson");
    });
  });

  describe("deleteLesson", () => {
    test("should delete lesson successfully", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "test-user-id" }],
        },
      };
      const mockLesson = {
        id: "lesson-id",
        title: "Test Lesson",
        description: "Lesson description",
        content: "Lesson content",
        sectionId: "section-id",
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        section: {
          course: {
            instructors: [{ userId: "test-user-id" }],
          },
        },
      };

      prisma.section.findUnique = jest.fn().mockResolvedValue(mockSection);
      prisma.lesson.findUnique = jest.fn().mockResolvedValue(mockLesson);
      prisma.lesson.delete = jest.fn().mockResolvedValue(mockLesson);

      const result = await deleteLesson({
        id: "lesson-id",
        sectionId: "section-id",
        userId: "test-user-id",
      });

      expect(result).toEqual(mockLesson);
      expect(prisma.lesson.delete).toHaveBeenCalledWith({
        where: { id: "lesson-id" },
      });
    });

    test("should throw an error if user is not an instructor", async () => {
      const mockSection = {
        id: "section-id",
        course: { instructors: [{ userId: "other-user-id" }] },
      };
      const mockLesson = {
        id: "lesson-id",
        section: { course: { instructors: [{ userId: "other-user-id" }] } },
      };

      prisma.section.findUnique = jest.fn().mockResolvedValue(mockSection);
      prisma.lesson.findUnique = jest.fn().mockResolvedValue(mockLesson);

      await expect(
        deleteLesson({
          id: "lesson-id",
          sectionId: "section-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to delete this lesson");
    });

    test("should throw error when section not found", async () => {
      prisma.section.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        deleteLesson({
          id: "lesson-id",
          sectionId: "section-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Section not found");
    });

    test("should throw error when lesson not found", async () => {
      const mockSection = {
        id: "section-id",
        course: {
          instructors: [{ userId: "test-user-id" }],
        },
      };

      prisma.section.findUnique = jest.fn().mockResolvedValue(mockSection);
      prisma.lesson.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        deleteLesson({
          id: "lesson-id",
          sectionId: "section-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Lesson not found");
    });
  });
});

describe("Media Management", () => {
  describe("createMedia", () => {
    test("should create a new media with valid values", async () => {
      const mockLesson = {
        id: "test-lesson-id",
        section: {
          course: {
            instructors: [{ userId: "test-user-id" }],
          },
        },
      };
      const resolvedValue = {
        id: "test-media-id",
        title: "Test Media",
        description: "This is a test media",
        mediaType: "video",
        content: "test content",
        url: "https://example.com/video.mp4",
        notes: "Test notes",
        transcript: "Test transcript",
        audience: "BEGINNERS",
        lessonId: "test-lesson-id",
        metadata: { duration: 120 },
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.lesson.findUniqueOrThrow = jest.fn().mockResolvedValue(mockLesson);
      prisma.media.create = jest.fn().mockResolvedValue(resolvedValue);

      const media = await createMedia({
        title: "Test Media",
        description: "This is a test media",
        mediaType: "video",
        content: "test content",
        url: "https://example.com/video.mp4",
        notes: "Test notes",
        transcript: "Test transcript",
        audience: "BEGINNERS",
        lessonId: "test-lesson-id",
        metadata: { duration: 120 },
        userId: "test-user-id",
      });

      expect(media).toEqual(resolvedValue);
      expect(prisma.media.create).toHaveBeenCalledWith({
        data: {
          title: "Test Media",
          description: "This is a test media",
          mediaType: "video",
          content: "test content",
          url: "https://example.com/video.mp4",
          notes: "Test notes",
          transcript: "Test transcript",
          audience: "BEGINNERS",
          lessonId: "test-lesson-id",
          metadata: { duration: 120 },
          userId: "test-user-id",
        },
      });
    });

    test("should create media without optional fields", async () => {
      const resolvedValue = {
        id: "test-media-id",
        title: "Test Media",
        description: "This is a test media",
        mediaType: "image",
        content: null,
        url: null,
        notes: null,
        transcript: null,
        audience: "BEGINNERS",
        lessonId: null,
        metadata: null,
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.media.create = jest.fn().mockResolvedValue(resolvedValue);

      const media = await createMedia({
        title: "Test Media",
        description: "This is a test media",
        mediaType: "image",
        userId: "test-user-id",
      });

      expect(media).toEqual(resolvedValue);
    });

    test("should throw error for unauthorized user when lesson is provided", async () => {
      const mockLesson = {
        id: "test-lesson-id",
        section: {
          course: {
            instructors: [{ userId: "other-user-id" }],
          },
        },
      };

      prisma.lesson.findUniqueOrThrow = jest.fn().mockResolvedValue(mockLesson);

      await expect(
        createMedia({
          title: "Test Media",
          description: "This is a test media",
          mediaType: "video",
          lessonId: "test-lesson-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to create media for this lesson");
    });
  });

  describe("updateMedia", () => {
    test("should update media when user is creator", async () => {
      const mockMedia = {
        id: "test-media-id",
        userId: "test-user-id",
      };
      const updatedMedia = {
        id: "test-media-id",
        title: "Updated Media",
        description: "Updated description",
        mediaType: "audio",
        content: "updated content",
        url: "https://example.com/updated.mp3",
        notes: "Updated notes",
        transcript: "Updated transcript",
        audience: "INTERMEDIATE",
        lessonId: "test-lesson-id",
        metadata: { duration: 180 },
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.media.findUniqueOrThrow = jest.fn().mockResolvedValue(mockMedia);
      prisma.media.update = jest.fn().mockResolvedValue(updatedMedia);

      const result = await updateMedia({
        id: "test-media-id",
        title: "Updated Media",
        description: "Updated description",
        mediaType: "audio",
        content: "updated content",
        url: "https://example.com/updated.mp3",
        notes: "Updated notes",
        transcript: "Updated transcript",
        audience: "INTERMEDIATE",
        metadata: { duration: 180 },
        userId: "test-user-id",
      });

      expect(result).toEqual(updatedMedia);
      expect(prisma.media.update).toHaveBeenCalledWith({
        where: { id: "test-media-id" },
        data: {
          title: "Updated Media",
          description: "Updated description",
          mediaType: "audio",
          content: "updated content",
          url: "https://example.com/updated.mp3",
          notes: "Updated notes",
          transcript: "Updated transcript",
          audience: "INTERMEDIATE",
          metadata: { duration: 180 },
        },
      });
    });

    test("should throw an error if the user is not the creator", async () => {
      const mockMedia = {
        id: "test-media-id",
        userId: "other-user-id",
      };
      prisma.media.findUniqueOrThrow = jest.fn().mockResolvedValue(mockMedia);
      await expect(
        updateMedia({
          id: "test-media-id",
          title: "Attempted Update",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to update this media");
    });
  });

  describe("getMedia", () => {
    test("should return media by id", async () => {
      const mockMedia = {
        id: "test-media-id",
        title: "Test Media",
        description: "Test description",
        mediaType: "video",
        content: "test content",
        url: "https://example.com/video.mp4",
        notes: "Test notes",
        transcript: "Test transcript",
        audience: "ADVANCED",
        lessonId: "test-lesson-id",
        metadata: { duration: 120 },
        userId: "test-user-id",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.media.findUnique = jest.fn().mockResolvedValue(mockMedia);

      const media = await getMedia("test-media-id");

      expect(media).toEqual(mockMedia);
      expect(prisma.media.findUnique).toHaveBeenCalledWith({
        where: { id: "test-media-id" },
      });
    });

    test("should return null for non-existent media", async () => {
      prisma.media.findUnique = jest.fn().mockResolvedValue(null);

      const media = await getMedia("non-existent-id");

      expect(media).toBeNull();
    });
  });

  describe("getAllMedia", () => {
    test("should return all media when no lessonId provided", async () => {
      const mockMedias = [
        {
          id: "media-1",
          title: "Media 1",
          description: "Description 1",
          mediaType: "video",
          audience: "BEGINNERS",
          lessonId: "lesson-1",
        },
        {
          id: "media-2",
          title: "Media 2",
          description: "Description 2",
          mediaType: "image",
          audience: "INTERMEDIATE",
          lessonId: "lesson-1",
        },
      ];

      prisma.media.findMany = jest.fn().mockResolvedValue(mockMedias);

      const medias = await getAllMedia("lesson-1");

      expect(medias).toHaveLength(2);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: { lessonId: "lesson-1" },
      });
    });

    test("should return media filtered by lessonId", async () => {
      const mockMedias = [
        {
          id: "media-1",
          title: "Media 1",
          description: "Description 1",
          mediaType: "video",
          audience: "students",
          lessonId: "lesson-1",
        },
      ];

      prisma.media.findMany = jest.fn().mockResolvedValue(mockMedias);

      const medias = await getAllMedia("lesson-1");

      expect(medias).toHaveLength(1);
      expect(prisma.media.findMany).toHaveBeenCalledWith({
        where: { lessonId: "lesson-1" },
      });
    });
  });

  describe("deleteMedia", () => {
    test("should delete media successfully when user is creator", async () => {
      const mockMedia = {
        id: "media-id",
        title: "Test Media",
        description: "Test description",
        mediaType: "video",
        content: null,
        url: null,
        notes: null,
        transcript: null,
        audience: "students",
        lessonId: "lesson-id",
        userId: "test-user-id",
        metadata: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prisma.media.findUnique = jest.fn().mockResolvedValue(mockMedia);
      prisma.media.delete = jest.fn().mockResolvedValue(mockMedia);

      const result = await deleteMedia({
        id: "media-id",
        userId: "test-user-id",
      });

      expect(result).toEqual(mockMedia);
      expect(prisma.media.delete).toHaveBeenCalledWith({
        where: { id: "media-id" },
      });
    });

    test("should throw an error if user is not the creator", async () => {
      const mockMedia = {
        id: "media-id",
        userId: "other-user-id",
      };

      prisma.media.findUnique = jest.fn().mockResolvedValue(mockMedia);

      await expect(
        deleteMedia({
          id: "media-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Unauthorized to delete this media");
    });

    test("should throw error when media not found", async () => {
      prisma.media.findUnique = jest.fn().mockResolvedValue(null);

      await expect(
        deleteMedia({
          id: "non-existent-id",
          userId: "test-user-id",
        }),
      ).rejects.toThrow("Media not found");
    });
  });
});
