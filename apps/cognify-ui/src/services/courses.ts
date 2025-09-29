import { apiClient } from "@/lib/api";

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  instructors: Array<{ id: string }>;
  conceptIds: string[];
}

export interface CourseDetail extends Omit<Course, "instructors"> {
  sections: Array<{
    id: string;
    title: string;
    description: string;
    order: number;
    conceptIds: string[];
    lessons: Array<{
      id: string;
      title: string;
      description: string;
      content: string | null;
      order: number;
      conceptIds: string[];
      media: Array<{
        id: string;
        title: string;
        description: string;
        mediaType: string;
        content?: string;
        url?: string;
        notes?: string;
        transcript?: string;
        metadata?: Record<string, unknown>;
        createdAt: string;
        updatedAt: string;
      }>;
    }>;
  }>;
}

export async function getCourses(): Promise<Course[]> {
  try {
    return await apiClient.getCourses();
  } catch (error) {
    console.error("Failed to fetch courses:", error);
    return [];
  }
}

export async function getCourse(
  identifier: string,
): Promise<CourseDetail | null> {
  try {
    const course = await apiClient.getCourse(identifier);
    return course;
  } catch (error) {
    console.error(`Failed to fetch course ${identifier}:`, error);
    return null;
  }
}

export function getLessonFromCourse(
  course: CourseDetail,
  lessonId: string,
): {
  lesson: CourseDetail["sections"][0]["lessons"][0];
  section: CourseDetail["sections"][0];
  next: CourseDetail["sections"][0]["lessons"][0] | null;
} | null {
  for (const section of course.sections) {
    const lessonIndex = section.lessons.findIndex(
      (lesson) => lesson.id === lessonId,
    );
    if (lessonIndex !== -1) {
      const lesson = section.lessons[lessonIndex];

      let nextLesson = null;
      if (lessonIndex < section.lessons.length - 1) {
        nextLesson = section.lessons[lessonIndex + 1];
      } else {
        const sectionIndex = course.sections.findIndex(
          (s) => s.id === section.id,
        );
        if (sectionIndex !== -1 && sectionIndex < course.sections.length - 1) {
          const nextSection = course.sections[sectionIndex + 1];
          if (nextSection.lessons.length > 0) {
            nextLesson = nextSection.lessons[0];
          }
        }
      }

      return {
        lesson,
        section,
        next: nextLesson,
      };
    }
  }

  return null;
}

export async function enrollInCourse(
  identifier: string,
  token: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const result = await apiClient.enrollInCourse(identifier, token);
    return {
      success: true,
      message: result.message,
    };
  } catch (error) {
    console.error(`Failed to enroll in course ${identifier}:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Enrollment failed",
    };
  }
}

export async function checkEnrollmentStatus(
  courseId: string,
  token: string,
): Promise<boolean> {
  try {
    const enrolledCourses = await apiClient.getStudentCourses(token);
    return enrolledCourses.some((course) => course.id === courseId);
  } catch (error) {
    console.error(
      `Failed to check enrollment status for course ${courseId}:`,
      error,
    );
    return false;
  }
}
