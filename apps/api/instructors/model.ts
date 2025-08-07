import type { Media } from "@prisma/client";
import prisma from "../prisma";
import slugify from "slugify";

interface CreateCourseInput {
  title: string;
  description: string;
  userId: string;
  conceptIds: string[];
  published?: boolean;
}

interface CreateSectionInput {
  id: string;
  title: string;
  description: string;
  conceptIds: string[];
  userId: string;
}

interface CreateLessionInput {
  sectionId: string;
  title: string;
  description: string;
  content: any;
  conceptIds: string[];
  userId: string;
}

interface CreateMediaInput {
  title: string;
  description: string;
  mediaType: string;
  content?: string;
  url?: string;
  notes?: string;
  transcript?: string;
  audience?: "BEGINNERS" | "INTERMEDIATE" | "ADVANCED";
  lessonId?: string;
  metadata?: any;
  userId: string;
}

export async function createCourse({
  title,
  description,
  conceptIds,
  userId,
  published = false,
}: CreateCourseInput) {
  console.log(`Creating course ${title} for user ${userId}`);
  const course = await prisma.course.create({
    data: {
      title,
      slug: slugify(title, { lower: true }),
      description,
      userId,
      published,
      conceptCourses: {
        create: conceptIds.map((conceptId: string) => ({
          concept: { connect: { id: conceptId } },
        })),
      },
    },
    include: {
      conceptCourses: {
        select: { conceptId: true },
      },
    },
  });

  console.log("Adding instructor: " + userId);
  await prisma.courseInstructor.create({
    data: {
      userId,
      courseId: course.id,
    },
  });
  return course;
}

export async function updateCourse({
  id,
  title,
  description,
  conceptIds,
  published,
  userId,
}: {
  id: string;
  title?: string;
  description?: string;
  conceptIds?: string[];
  published?: boolean;
  userId: string;
}) {
  console.log(`Updating course id: ${id}`);
  const course = await prisma.course.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      instructors: true,
    },
  });

  if (!course) {
    throw new Error("Invalid course or user");
  }

  const isInstructor = course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to update this course");
  }

  const payload: {
    where: { id: string };
    data: { title?: string; description?: string; published?: boolean };
  } = {
    where: { id },
    data: {},
  };

  if (title) payload.data.title = title;
  if (description) payload.data.description = description;
  if (published !== undefined) payload.data.published = published;

  const updatedCourse = await prisma.course.update(payload);

  if (conceptIds) {
    await prisma.conceptCourse.deleteMany({
      where: { courseId: id },
    });
    if (conceptIds.length > 0) {
      const createData = conceptIds.map((conceptId) => ({
        courseId: id,
        conceptId,
      }));
      await prisma.conceptCourse.createMany({
        data: createData,
      });
    }
  }

  return updatedCourse;
}

export async function getCourses(userId: string) {
  const courses = await prisma.course.findMany({
    where: {
      OR: [
        { userId },
        {
          instructors: {
            some: {
              userId,
            },
          },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      conceptCourses: {
        select: { conceptId: true },
      },
      instructors: true,
    },
  });
  return courses.map((course) => ({
    ...{ ...course, conceptCourses: undefined },
    conceptIds: course.conceptCourses.map((cc) => cc.conceptId),
  }));
}

export async function getCourse(identifier: string) {
  console.log(`GET course ${identifier}`);
  const course = await prisma.course.findFirst({
    where: {
      OR: [{ id: identifier }, { slug: identifier }],
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

  if (!course) return null;

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
        media: lesson.media.map((mediaItem) => ({
          ...mediaItem,
          createdAt: mediaItem.createdAt.toISOString(),
          updatedAt: mediaItem.updatedAt.toISOString(),
        })),
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

export async function createSection({
  id,
  title,
  description,
  conceptIds,
  userId,
}: CreateSectionInput) {
  const course = await prisma.course.findUniqueOrThrow({
    where: {
      id,
    },
    include: {
      sections: true,
      instructors: true,
    },
  });

  if (!course) {
    throw new Error("Invalid course or user");
  }

  const isInstructor = course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to create a section for this course");
  }

  console.log(`Creating section for course id: ${id}`);
  const section = await prisma.section.create({
    data: {
      title,
      description,
      order: course.sections.length,
      course: {
        connect: { id },
      },
      ConceptSection: {
        create: conceptIds.map((conceptId: string) => ({
          concept: { connect: { id: conceptId } },
        })),
      },
    },
  });
  return section;
}

export async function updateSection({
  id,
  title,
  description,
  conceptIds,
  userId,
}: {
  id: string;
  title?: string;
  description?: string;
  conceptIds?: string[];
  userId: string;
}) {
  console.log(`Updating section id: ${id}`);
  const section = await prisma.section.findUniqueOrThrow({
    where: { id },
    include: {
      course: {
        include: { instructors: true },
      },
    },
  });

  const isInstructor = section.course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to update this section");
  }

  const payload: {
    where: { id: string };
    data: { title?: string; description?: string };
  } = {
    where: { id },
    data: {},
  };

  if (title !== undefined) payload.data.title = title;
  if (description !== undefined) payload.data.description = description;

  const updatedSection = await prisma.section.update(payload);

  if (conceptIds !== undefined) {
    await prisma.conceptSection.deleteMany({
      where: { sectionId: id },
    });
    if (conceptIds.length > 0) {
      const createData = conceptIds.map((conceptId) => ({
        sectionId: id,
        conceptId,
      }));
      await prisma.conceptSection.createMany({
        data: createData,
      });
    }
  }

  return updatedSection;
}

export async function updateCourseSectionOrder({
  userId,
  id,
  order,
}: {
  userId: string;
  id: string;
  order: { id: string; order: number }[];
}) {
  const course = await prisma.course.findUniqueOrThrow({
    where: { id },
    include: {
      instructors: true,
    },
  });

  const isInstructor = course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to update sections for this course");
  }
  console.log(`Updating section order for course id: ${id}`);
  const sectionUpdatePromises = order.map(({ id, order }) =>
    prisma.section.update({
      where: { id },
      data: { order },
    }),
  );
  return await Promise.all(sectionUpdatePromises);
}

export async function updateCourseLessonOrder({
  userId,
  courseId,
  ordering,
}: {
  userId: string;
  courseId: string;
  ordering: { id: string; sectionId: string; order: number }[];
}) {
  console.log(`Updating lesson order for course id: ${courseId}`);
  const course = await prisma.course.findUniqueOrThrow({
    where: { id: courseId },
    include: {
      instructors: true,
    },
  });

  const isInstructor = course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to update lesson order for this course");
  }

  const lessonUpdatePromises = ordering.map(({ id, sectionId, order }) =>
    prisma.lesson.update({
      where: { id },
      data: { order, sectionId },
    }),
  );
  return await Promise.all(lessonUpdatePromises);
}

export async function createLesson({
  sectionId,
  title,
  description,
  content,
  conceptIds,
  userId,
}: CreateLessionInput) {
  console.log(`Creating lesson for section id: ${sectionId}`);
  const section = await prisma.section.findUniqueOrThrow({
    where: {
      id: sectionId,
    },
    include: {
      lessons: true,
      course: {
        include: {
          instructors: true,
        },
      },
    },
  });

  const isInstructor = section.course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to create a lesson for this course");
  }

  return await prisma.lesson.create({
    data: {
      title,
      description,
      sectionId,
      content,
      order: section?.lessons?.length || 0,
      ConceptLesson: {
        create: conceptIds?.map((conceptId: string) => ({
          concept: { connect: { id: conceptId } },
        })),
      },
    },
  });
}

export async function updateLesson({
  lessonId,
  sectionId,
  updates,
  userId,
}: {
  lessonId: string;
  sectionId: string;
  updates: Partial<{
    title: string;
    description: string;
    content: string;
    conceptIds: string[];
  }>;
  userId: string;
}) {
  console.log(`Updating lesson id: ${lessonId} in section id: ${sectionId}`);

  const section = await prisma.section.findUniqueOrThrow({
    where: { id: sectionId },
    include: {
      course: {
        include: { instructors: true },
      },
    },
  });

  console.log(section.course.instructors, userId);

  const isInstructor = section.course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to update this lesson");
  }

  console.log({ lessonId, sectionId });

  const updatedLesson = await prisma.lesson.update({
    where: { id: lessonId, sectionId },
    data: {
      ...(updates.title && { title: updates.title }),
      ...(updates.description && { description: updates.description }),
      ...(updates.content && { content: updates.content }),
    },
  });

  if (updates.conceptIds) {
    await prisma.conceptLesson.deleteMany({
      where: { lessonId },
    });
    if (updates.conceptIds.length > 0) {
      const createData = updates.conceptIds.map((conceptId) => ({
        lessonId,
        conceptId,
      }));
      await prisma.conceptLesson.createMany({
        data: createData,
      });
    }
  }

  console.log(`Lesson updated successfully: ${updatedLesson.id}`);
  return updatedLesson;
}

export async function deleteSection({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  console.log(`Deleting section id: ${id}`);
  const section = await prisma.section.findUnique({
    where: { id },
    include: {
      course: {
        include: {
          instructors: true,
        },
      },
      lessons: true,
    },
  });
  if (!section) {
    throw new Error("Section not found");
  }

  if (section.lessons.length) {
    throw new Error("Cannot delete section with lessons");
  }

  const isInstructor = section.course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to delete this section");
  }
  return await prisma.section.delete({ where: { id } });
}

export async function deleteLesson({
  id,
  sectionId,
  userId,
}: {
  id: string;
  sectionId: string;
  userId: string;
}) {
  console.log(`Deleting lesson id: ${id} in section id: ${sectionId}`);
  const section = await prisma.section.findUnique({
    where: { id: sectionId },
    include: {
      course: {
        include: {
          instructors: true,
        },
      },
    },
  });
  if (!section) {
    throw new Error("Section not found");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      section: {
        include: {
          course: {
            include: {
              instructors: true,
            },
          },
        },
      },
    },
  });
  if (!lesson) {
    throw new Error("Lesson not found");
  }

  const isInstructor = lesson.section.course.instructors.some(
    (instructor) => instructor.userId === userId,
  );
  if (!isInstructor) {
    throw new Error("Unauthorized to delete this lesson");
  }
  return await prisma.lesson.delete({ where: { id } });
}

export async function createMedia({
  title,
  description,
  mediaType,
  content,
  url,
  notes,
  transcript,
  audience,
  lessonId,
  metadata,
  userId,
}: CreateMediaInput): Promise<Media> {
  console.log(
    `Creating media ${title} for user ${userId} for lesson ${lessonId}`,
  );

  if (lessonId) {
    const lesson = await prisma.lesson.findUniqueOrThrow({
      where: { id: lessonId },
      include: {
        section: {
          include: {
            course: {
              include: {
                instructors: true,
              },
            },
          },
        },
      },
    });

    const isInstructor = lesson.section.course.instructors.some(
      (instructor) => instructor.userId === userId,
    );
    if (!isInstructor) {
      throw new Error("Unauthorized to create media for this lesson");
    }
  }

  const mediaData: any = {
    title,
    description,
    mediaType,
    lessonId,
    userId,
  };

  if (content) mediaData.content = content;
  if (url) mediaData.url = url;
  if (notes) mediaData.notes = notes;
  if (transcript) mediaData.transcript = transcript;
  if (audience) mediaData.audience = audience;
  if (lessonId) mediaData.lessonId = lessonId;
  if (metadata) mediaData.metadata = metadata;

  return await prisma.media.create({
    data: mediaData,
  });
}

export async function updateMedia({
  id,
  title,
  description,
  mediaType,
  content,
  url,
  notes,
  transcript,
  audience,
  metadata,
  userId,
}: {
  id: string;
  title?: string;
  description?: string;
  mediaType?: string;
  content?: string;
  url?: string;
  notes?: string;
  transcript?: string;
  audience?: "BEGINNERS" | "INTERMEDIATE" | "ADVANCED";
  metadata?: any;
  userId: string;
}) {
  console.log(`Updating media id: ${id}`);

  const media = await prisma.media.findUniqueOrThrow({
    where: { id },
  });

  if ((media as any).userId !== userId) {
    throw new Error("Unauthorized to update this media");
  }

  const updateData: any = {};
  if (title !== undefined) updateData.title = title;
  if (description !== undefined) updateData.description = description;
  if (mediaType !== undefined) updateData.mediaType = mediaType;
  if (content !== undefined) updateData.content = content;
  if (url !== undefined) updateData.url = url;
  if (notes !== undefined) updateData.notes = notes;
  if (transcript !== undefined) updateData.transcript = transcript;
  if (audience !== undefined) updateData.audience = audience;
  if (metadata !== undefined) updateData.metadata = metadata;

  return await prisma.media.update({
    where: { id },
    data: updateData,
  });
}

export async function getMedia(id: string) {
  return await prisma.media.findUnique({
    where: { id },
  });
}

export async function getAllMedia(lessonId: string) {
  return await prisma.media.findMany({
    where: { lessonId },
  });
}

export async function deleteMedia({
  id,
  userId,
}: {
  id: string;
  userId: string;
}) {
  console.log(`Deleting media id: ${id}`);

  const media = await prisma.media.findUnique({
    where: { id },
  });

  if (!media) {
    throw new Error("Media not found");
  }

  if ((media as any).userId !== userId) {
    throw new Error("Unauthorized to delete this media");
  }

  return await prisma.media.delete({ where: { id } });
}
