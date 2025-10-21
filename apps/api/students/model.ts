import prisma from "../prisma";

export async function getProfile({ userId }: { userId?: string } = {}) {
  console.debug(`Fetching profile for user: ${userId}`);

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId!,
      },
    });

    if (!user) {
      console.debug(`User not found: ${userId}`);
      return {
        createdAt: undefined,
        updatedAt: undefined,
      };
    }

    console.debug(`Found user profile: ${user.username} (${user.id})`);

    const profile = {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    console.debug(`Profile data transformed for user: ${userId}`);
    return profile;
  } catch (error) {
    console.error(`Failed to fetch profile for user: ${userId}`, error);
    throw error;
  }
}

export async function getCourses({ userId }: { userId?: string } = {}) {
  if (userId) {
    console.debug(`Fetching enrolled courses for student: ${userId}`);
  } else {
    console.debug("Fetching all courses");
  }

  try {
    const courses = await prisma.course.findMany({
      where: {
        ...(userId ? { enrollments: { some: { userId: userId } } } : {}),
      },
      include: {
        conceptCourses: {
          select: { conceptId: true },
        },
      },
    });

    console.debug(
      `Retrieved ${courses.length} courses${userId ? ` for student ${userId}` : ""}`,
    );

    const transformedCourses = courses.map((course) => ({
      ...{ ...course, conceptCourses: undefined },
      conceptIds: course.conceptCourses?.map((cc) => cc.conceptId) || [],
      createdAt: course.createdAt.toISOString(),
      updatedAt: course.updatedAt.toISOString(),
    }));

    console.debug(`Course data transformed for ${courses.length} courses`);
    return transformedCourses;
  } catch (error) {
    console.error(
      `Failed to fetch courses${userId ? ` for student ${userId}` : ""}`,
      error,
    );
    throw error;
  }
}

// export async function updateProgress({
//   lessonId,
//   courseId,
//   userId,
//   progress,
// }: {
//   lessonId: string;
//   courseId: string;
//   userId: string;
//   progress: number;
// }) {
//   const lesson = await prisma.lesson.findUnique({
//     where: {
//       id: lessonId,
//     },
//   });

//   if (!lesson) {
//     throw new Error("Lesson not found");
//   }

//   const course = await prisma.course.findUnique({
//     where: {
//       id: courseId,
//     },
//   });

//   if (!course) {
//     throw new Error("Course not found");
//   }

//   const student = await prisma.student.findUnique({
//     where: {
//       userId_courseId: {
//         userId,
//         courseId,
//       },
//     },
//   });

//   if (!student) {
//     throw new Error("Student not found");
//   }

//   return await prisma.student.update({
//     where: {
//       id: student.id,
//     },
//     data: {
//       progress: {
//         upsert: {
//           create: { lessonId, progress },
//           update: { progress },
//         },
//       },
//     },
//   });
// }

export async function recordLessonProgress({
  userId,
  lessonId,
  completed,
}: {
  userId: string;
  lessonId: string;
  completed: boolean;
}) {
  console.debug(
    `Recording lesson progress for user: ${userId}, lesson: ${lessonId}, completed: ${completed}`,
  );

  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson) {
      throw new Error("Lesson not found");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        userId,
        lessonId,
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    console.debug(
      `Lesson progress recorded successfully for user: ${userId}, lesson: ${lessonId}`,
    );

    return {
      ...progress,
      createdAt: progress.createdAt.toISOString(),
      updatedAt: progress.updatedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString() || null,
    };
  } catch (error) {
    console.error(
      `Failed to record lesson progress for user: ${userId}, lesson: ${lessonId}`,
      error,
    );
    throw error;
  }
}

export async function getLessonProgress({
  userId,
  lessonId,
}: {
  userId: string;
  lessonId: string;
}) {
  console.debug(
    `Fetching lesson progress for user: ${userId}, lesson: ${lessonId}`,
  );

  try {
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
    });

    if (!progress) {
      return null;
    }

    return {
      ...progress,
      createdAt: progress.createdAt.toISOString(),
      updatedAt: progress.updatedAt.toISOString(),
      completedAt: progress.completedAt?.toISOString() || null,
    };
  } catch (error) {
    console.error(
      `Failed to fetch lesson progress for user: ${userId}, lesson: ${lessonId}`,
      error,
    );
    throw error;
  }
}

export async function getStudentProgress({
  userId,
  courseId,
}: {
  userId: string;
  courseId?: string;
}) {
  console.debug(
    `Fetching all lesson progress for user: ${userId}${courseId ? ` in course: ${courseId}` : ""}`,
  );

  try {
    const whereClause: any = { userId };

    if (courseId) {
      whereClause.lesson = {
        section: {
          courseId,
        },
      };
    }

    const progress = await prisma.lessonProgress.findMany({
      where: whereClause,
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

    return progress.map((p: any) => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      completedAt: p.completedAt?.toISOString() || null,
      lesson: {
        ...p.lesson,
        createdAt: p.lesson.createdAt.toISOString(),
        updatedAt: p.lesson.updatedAt.toISOString(),
        section: {
          ...p.lesson.section,
          createdAt: p.lesson.section.createdAt.toISOString(),
          updatedAt: p.lesson.section.updatedAt.toISOString(),
          course: {
            ...p.lesson.section.course,
            createdAt: p.lesson.section.course.createdAt.toISOString(),
            updatedAt: p.lesson.section.course.updatedAt.toISOString(),
          },
        },
      },
    }));
  } catch (error) {
    console.error(`Failed to fetch lesson progress for user: ${userId}`, error);
    throw error;
  }
}

export async function getConceptsFromCompletedLessons({
  userId,
}: {
  userId: string;
}) {
  console.debug(`Fetching concepts from completed lessons for user: ${userId}`);

  try {
    const completedLessons = await prisma.lessonProgress.findMany({
      where: {
        userId,
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

    const conceptMap = new Map();

    completedLessons.forEach((progress: any) => {
      progress.lesson.ConceptLesson.forEach((conceptLesson: any) => {
        const concept = conceptLesson.concept;
        if (!conceptMap.has(concept.id)) {
          conceptMap.set(concept.id, {
            ...concept,
            createdAt: concept.createdAt.toISOString(),
            updatedAt: concept.updatedAt.toISOString(),
            completedLessons: [],
          });
        }

        conceptMap.get(concept.id).completedLessons.push({
          lessonId: progress.lesson.id,
          lessonTitle: progress.lesson.title,
          completedAt: progress.completedAt?.toISOString() || null,
        });
      });
    });

    return Array.from(conceptMap.values());
  } catch (error) {
    console.error(
      `Failed to fetch concepts from completed lessons for user: ${userId}`,
      error,
    );
    throw error;
  }
}
