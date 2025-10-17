import prisma from "../prisma";

export async function getCourses() {
  console.debug("Fetching all courses");
  const courses = await prisma.course.findMany({
    include: {
      conceptCourses: {
        select: { conceptId: true },
      },
      instructors: true,
    },
  });
  console.debug(`Retrieved ${courses.length} courses`);
  return courses.map((course) => ({
    ...{ ...course, conceptCourses: undefined },
    conceptIds: course.conceptCourses.map((cc) => cc.conceptId),
  }));
}

export async function getCourse(
  identifier: string,
  includeUnpublished: boolean = false,
) {
  console.debug(
    `Fetching course with identifier: ${identifier}, includeUnpublished: ${includeUnpublished}`,
  );
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
      // Only include published courses unless explicitly requested
      ...(includeUnpublished ? {} : { published: true }),
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

  if (!course) {
    console.debug(`Course not found for identifier: ${identifier}`);
    return null;
  }

  console.debug(`Found course: ${course.title} (${course.id})`);
  console.debug(
    `Transforming course data with ${course.sections.length} sections`,
  );

  const { conceptCourses, sections, ...rest } = course;
  const courseConceptIds = conceptCourses.map((cc) => cc.conceptId);

  const transformedSections = sections.map((section) => {
    const sectionConceptIds = section.ConceptSection.map((cs) => cs.concept.id);
    const transformedLessons = section.lessons.map((lesson) => {
      const lessonConceptIds = lesson.ConceptLesson.map((cl) => cl.concept.id);
      const { ConceptLesson, ...lessonRest } = lesson;
      return {
        ...lessonRest,
        conceptIds: lessonConceptIds,
        media:
          lesson.media?.map((mediaItem) => ({
            ...mediaItem,
            content: mediaItem.content || undefined,
            url: mediaItem.url || undefined,
            notes: mediaItem.notes || undefined,
            transcript: mediaItem.transcript || undefined,
            metadata: mediaItem.metadata || undefined,
            createdAt: mediaItem.createdAt.toISOString(),
            updatedAt: mediaItem.updatedAt.toISOString(),
          })) || [],
      };
    });
    const { ConceptSection, ...sectionRest } = section;
    return {
      ...sectionRest,
      conceptIds: sectionConceptIds,
      lessons: transformedLessons,
    };
  });

  return {
    ...rest,
    conceptIds: courseConceptIds,
    sections: transformedSections,
  };
}

export async function enrolStudent({
  identifier,
  userId,
}: {
  identifier: string;
  userId: string;
}) {
  console.debug(`Enrolling student ${userId} in course ${identifier}`);

  try {
    const course = await prisma.course.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
    });
    if (!course) {
      console.error(`Course not found for identifier: ${identifier}`);
      throw new Error("Course not found");
    }

    console.debug(`Found course: ${course.title} (${course.id})`);
    console.debug(`Checking existing enrollment for user ${userId}`);

    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        courseId: course.id,
        userId,
      },
    });
    if (existingEnrollment) {
      console.error(`User ${userId} already enrolled in course ${course.id}`);
      throw new Error("User already enrolled in this course");
    }

    console.debug(
      `Creating enrollment for user ${userId} in course ${course.id}`,
    );
    const enrolment = await prisma.enrollment.create({
      data: {
        courseId: course.id,
        userId,
      },
    });

    return enrolment;
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message === "Course not found" ||
        error.message === "User already enrolled in this course")
    ) {
      throw error;
    }
    console.error(
      `Failed to enroll student ${userId} in course ${identifier}:`,
      error,
    );
    throw error;
  }
}
