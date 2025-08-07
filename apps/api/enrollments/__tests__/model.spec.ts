import { afterEach, describe, expect, jest, mock, test } from "bun:test";
import prisma from "../../prisma";
import {
  createEnrollment,
  getEnrollments,
  getEnrollment,
  deleteEnrollment,
  type CreateEnrollmentParams,
  type GetEnrollmentsParams,
} from "../model";

const mockFindUniqueUser = mock(() => null);
const mockFindUniqueCourse = mock(() => null);
const mockFindUniqueEnrollment = mock(() => null);
const mockCreateEnrollment = mock(() => null);
const mockFindManyEnrollments = mock(() => []);
const mockCountEnrollments = mock(() => 0);
const mockDeleteEnrollment = mock(() => null);

prisma.user.findUnique = mockFindUniqueUser as any;
prisma.course.findUnique = mockFindUniqueCourse as any;
prisma.enrollment.findUnique = mockFindUniqueEnrollment as any;
prisma.enrollment.create = mockCreateEnrollment as any;
prisma.enrollment.findMany = mockFindManyEnrollments as any;
prisma.enrollment.count = mockCountEnrollments as any;
prisma.enrollment.delete = mockDeleteEnrollment as any;

afterEach(() => {
  jest.restoreAllMocks();
  mockFindUniqueUser.mockClear();
  mockFindUniqueCourse.mockClear();
  mockFindUniqueEnrollment.mockClear();
  mockCreateEnrollment.mockClear();
  mockFindManyEnrollments.mockClear();
  mockCountEnrollments.mockClear();
  mockDeleteEnrollment.mockClear();
});

describe("Enrollment Model", () => {
  describe("createEnrollment", () => {
    const mockUser = {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
      roles: [{ role: "STUDENT" }],
    };

    const mockCourse = {
      id: "course-1",
      title: "Introduction to Math",
      slug: "intro-math",
      published: true,
    };

    const mockEnrollment = {
      id: "enrollment-1",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date("2024-01-01"),
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
      },
      course: {
        id: "course-1",
        title: "Introduction to Math",
        slug: "intro-math",
      },
    };

    const params: CreateEnrollmentParams = {
      userId: "user-1",
      courseId: "course-1",
    };

    test("should create enrollment successfully", async () => {
      mockFindUniqueUser.mockImplementation(() => mockUser as any);
      mockFindUniqueCourse.mockImplementation(() => mockCourse as any);
      mockFindUniqueEnrollment.mockImplementation(() => null);
      mockCreateEnrollment.mockImplementation(() => mockEnrollment as any);

      const result = await createEnrollment(params);

      expect(result).toEqual(mockEnrollment);
      expect(mockFindUniqueUser).toHaveBeenCalledWith({
        where: { id: "user-1" },
        include: { roles: true },
      });
      expect(mockFindUniqueCourse).toHaveBeenCalledWith({
        where: { id: "course-1" },
      });
      expect(mockFindUniqueEnrollment).toHaveBeenCalledWith({
        where: {
          userId_courseId: {
            userId: "user-1",
            courseId: "course-1",
          },
        },
      });
      expect(mockCreateEnrollment).toHaveBeenCalledWith({
        data: {
          userId: "user-1",
          courseId: "course-1",
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    });

    test("should throw error when user not found", async () => {
      mockFindUniqueUser.mockImplementation(() => null);

      await expect(createEnrollment(params)).rejects.toThrow("User not found");
    });

    test("should throw error when user does not have STUDENT role", async () => {
      const userWithoutStudentRole = {
        ...mockUser,
        roles: [{ role: "INSTRUCTOR" }],
      };
      mockFindUniqueUser.mockImplementation(
        () => userWithoutStudentRole as any,
      );

      await expect(createEnrollment(params)).rejects.toThrow(
        "User must have STUDENT role to enroll",
      );
    });

    test("should throw error when course not found", async () => {
      mockFindUniqueUser.mockImplementation(() => mockUser as any);
      mockFindUniqueCourse.mockImplementation(() => null);

      await expect(createEnrollment(params)).rejects.toThrow(
        "Course not found",
      );
    });

    test("should throw error when course is not published", async () => {
      const unpublishedCourse = { ...mockCourse, published: false };
      mockFindUniqueUser.mockImplementation(() => mockUser as any);
      mockFindUniqueCourse.mockImplementation(() => unpublishedCourse as any);

      await expect(createEnrollment(params)).rejects.toThrow(
        "Cannot enroll in unpublished course",
      );
    });

    test("should throw error when enrollment already exists", async () => {
      mockFindUniqueUser.mockImplementation(() => mockUser as any);
      mockFindUniqueCourse.mockImplementation(() => mockCourse as any);
      mockFindUniqueEnrollment.mockImplementation(() => mockEnrollment as any);

      await expect(createEnrollment(params)).rejects.toThrow(
        "User is already enrolled in this course",
      );
    });
  });

  describe("getEnrollments", () => {
    const mockEnrollments = [
      {
        id: "enrollment-1",
        userId: "user-1",
        courseId: "course-1",
        createdAt: new Date("2024-01-01"),
        user: {
          id: "user-1",
          name: "John Doe",
          email: "john@example.com",
        },
        course: {
          id: "course-1",
          title: "Introduction to Math",
          slug: "intro-math",
        },
      },
    ];

    test("should return enrollments with pagination", async () => {
      const params: GetEnrollmentsParams = { page: 1, limit: 10 };
      mockFindManyEnrollments.mockImplementation(() => mockEnrollments as any);
      mockCountEnrollments.mockImplementation(() => 25);

      const result = await getEnrollments(params);

      expect(result).toEqual({
        enrollments: mockEnrollments,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          pages: 3,
        },
      });
      expect(mockFindManyEnrollments).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    test("should filter by userId", async () => {
      const params: GetEnrollmentsParams = { userId: "user-1" };
      mockFindManyEnrollments.mockImplementation(() => mockEnrollments as any);
      mockCountEnrollments.mockImplementation(() => 1);

      await getEnrollments(params);

      expect(mockFindManyEnrollments).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    test("should filter by courseId", async () => {
      const params: GetEnrollmentsParams = { courseId: "course-1" };
      mockFindManyEnrollments.mockImplementation(() => mockEnrollments as any);
      mockCountEnrollments.mockImplementation(() => 1);

      await getEnrollments(params);

      expect(mockFindManyEnrollments).toHaveBeenCalledWith({
        where: { courseId: "course-1" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });

    test("should use default pagination when not provided", async () => {
      const params: GetEnrollmentsParams = {};
      mockFindManyEnrollments.mockImplementation(() => mockEnrollments as any);
      mockCountEnrollments.mockImplementation(() => 1);

      await getEnrollments(params);

      expect(mockFindManyEnrollments).toHaveBeenCalledWith({
        where: {},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("getEnrollment", () => {
    const mockEnrollment = {
      id: "enrollment-1",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date("2024-01-01"),
      user: {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
      },
      course: {
        id: "course-1",
        title: "Introduction to Math",
        slug: "intro-math",
      },
    };

    test("should return enrollment when found", async () => {
      mockFindUniqueEnrollment.mockImplementation(() => mockEnrollment as any);

      const result = await getEnrollment("enrollment-1");

      expect(result).toEqual(mockEnrollment);
      expect(mockFindUniqueEnrollment).toHaveBeenCalledWith({
        where: { id: "enrollment-1" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
        },
      });
    });

    test("should return null when enrollment not found", async () => {
      mockFindUniqueEnrollment.mockImplementation(() => null);

      const result = await getEnrollment("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("deleteEnrollment", () => {
    const mockEnrollment = {
      id: "enrollment-1",
      userId: "user-1",
      courseId: "course-1",
      createdAt: new Date("2024-01-01"),
    };

    test("should delete enrollment successfully", async () => {
      mockFindUniqueEnrollment.mockImplementation(() => mockEnrollment as any);
      mockDeleteEnrollment.mockImplementation(() => mockEnrollment as any);

      await deleteEnrollment("enrollment-1");

      expect(mockFindUniqueEnrollment).toHaveBeenCalledWith({
        where: { id: "enrollment-1" },
      });
      expect(mockDeleteEnrollment).toHaveBeenCalledWith({
        where: { id: "enrollment-1" },
      });
    });

    test("should throw error when enrollment not found", async () => {
      mockFindUniqueEnrollment.mockImplementation(() => null);

      await expect(deleteEnrollment("non-existent")).rejects.toThrow(
        "Enrollment not found",
      );
      expect(mockDeleteEnrollment).not.toHaveBeenCalled();
    });
  });
});
