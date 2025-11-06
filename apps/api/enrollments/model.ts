import prisma from "../prisma";

export interface CreateEnrollmentParams {
  userId: string;
  courseId: string;
}

export interface GetEnrollmentsParams {
  userId?: string;
  courseId?: string;
  page?: number;
  limit?: number;
}

export interface EnrollmentWithRelations {
  id: string;
  userId: string;
  courseId: string;
  createdAt: Date;
  completed: boolean;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
}

export interface PaginatedEnrollments {
  enrollments: EnrollmentWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export async function createEnrollment({
  userId,
  courseId,
}: CreateEnrollmentParams): Promise<EnrollmentWithRelations> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      roles: true,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hasStudentRole = user.roles.some((role) => role.role === "STUDENT");
  if (!hasStudentRole) {
    throw new Error("User must have STUDENT role to enroll");
  }

  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course || !course.published) {
    throw new Error("Course not found");
  }

  const existingEnrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId,
      },
    },
  });

  if (existingEnrollment) {
    throw new Error("User is already enrolled in this course");
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId,
      courseId,
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

  return enrollment;
}

export async function getEnrollments({
  userId,
  courseId,
  page = 1,
  limit = 10,
}: GetEnrollmentsParams): Promise<PaginatedEnrollments> {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (userId) where.userId = userId;
  if (courseId) where.courseId = courseId;

  const enrollments = await prisma.enrollment.findMany({
    where,
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
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prisma.enrollment.count({ where });

  return {
    enrollments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getEnrollment(
  id: string,
): Promise<EnrollmentWithRelations | null> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
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

  return enrollment;
}

export async function deleteEnrollment(id: string): Promise<void> {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  await prisma.enrollment.delete({
    where: { id },
  });
}
