/**
 * React Query hooks for API calls
 * Provides:
 * - Automatic caching
 * - Request deduplication
 * - Loading states
 * - Error handling
 * - Automatic refetching
 * - Optimistic updates
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./api-client";

// Auth endpoints
export function useLogin() {
  return useMutation({
    mutationFn: async (data: { handle: string; password: string }) => {
      return apiClient.post<{ token: string }>("/auth/login", data, {
        skipAuth: true,
      });
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: {
      name: string;
      username: string;
      email: string;
      password: string;
    }) => {
      return apiClient.post<{ token: string }>("/auth/signup", data, {
        skipAuth: true,
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiClient.post<{ message: string }>("/auth/logout");
    },
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
    },
  });
}

// Courses
export function useCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: () => apiClient.get<Course[]>("/courses", { skipAuth: true }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCourse(identifier: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["course", identifier],
    queryFn: () => apiClient.get<CourseDetail>(`/courses/${identifier}`),
    enabled: enabled && !!identifier,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentCourses() {
  return useQuery({
    queryKey: ["student", "courses"],
    queryFn: () => apiClient.get<EnrolledCourse[]>("/student/courses"),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useInstructorCourses() {
  return useQuery({
    queryKey: ["instructor", "courses"],
    queryFn: () => apiClient.get<InstructorCourse[]>("/instructor/courses"),
    staleTime: 2 * 60 * 1000,
  });
}

export function useInstructorCourse(id: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["instructor", "course", id],
    queryFn: () =>
      apiClient.get<InstructorCourseDetail>(`/instructor/courses/${id}`),
    enabled: enabled && !!id,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateCourseData) => {
      return apiClient.post<InstructorCourse>("/instructor/courses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCourseData;
    }) => {
      return apiClient.patch<InstructorCourse>(
        `/instructor/courses/${id}`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.id],
      });
    },
  });
}

export function useEnrollInCourse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (identifier: string) => {
      return apiClient.post<{ message: string }>(
        `/courses/${identifier}/students`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student", "courses"] });
    },
  });
}

// Concepts
export function useConcepts() {
  return useQuery({
    queryKey: ["concepts"],
    queryFn: () => apiClient.get<Concept[]>("/concepts", { skipAuth: true }),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useConceptsFromCompletedLessons() {
  return useQuery({
    queryKey: ["student", "concepts", "completed"],
    queryFn: () =>
      apiClient.get<{ concepts: ConceptWithRelations[] }>(
        "/student/concepts/completed",
      ),
    staleTime: 5 * 60 * 1000,
  });
}

// Profile
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => apiClient.get<Profile>("/student/profile"),
    staleTime: 5 * 60 * 1000,
  });
}

// Certificates
export function useCertificates(userId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["certificates", userId],
    queryFn: () =>
      apiClient.get<{ certificates: Certificate[] }>(
        `/certificates/student/${userId}`,
      ),
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

// Lesson Progress
export function useLessonProgress(lessonId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["lesson", "progress", lessonId],
    queryFn: () =>
      apiClient.get<{ progress: LessonProgress | null }>(
        `/student/lessons/${lessonId}/progress`,
      ),
    enabled: enabled && !!lessonId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useRecordLessonProgress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { lessonId: string; completed: boolean }) => {
      return apiClient.post<{ message: string; progress: LessonProgress }>(
        "/student/lessons/progress",
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["lesson", "progress", variables.lessonId],
      });
      queryClient.invalidateQueries({
        queryKey: ["student", "concepts", "completed"],
      });
    },
  });
}

// Section management
export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      data,
    }: {
      courseId: string;
      data: CreateSectionData;
    }) => {
      return apiClient.post<Section>(
        `/instructor/courses/${courseId}/sections`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

export function useUpdateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      sectionId,
      data,
    }: {
      courseId: string;
      sectionId: string;
      data: UpdateSectionData;
    }) => {
      return apiClient.patch<Section>(
        `/instructor/courses/${courseId}/sections/${sectionId}`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      sectionId,
    }: {
      courseId: string;
      sectionId: string;
    }) => {
      return apiClient.delete<{ message: string }>(
        `/instructor/courses/${courseId}/sections/${sectionId}`,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

export function useReorderSections() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      order,
    }: {
      courseId: string;
      order: Array<{ id: string; order: number }>;
    }) => {
      return apiClient.patch<{ message: string }>(
        `/instructor/courses/${courseId}/sections/order`,
        { order },
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

// Lesson management
export function useCreateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      sectionId,
      data,
    }: {
      courseId: string;
      sectionId: string;
      data: CreateLessonData;
    }) => {
      return apiClient.post<Lesson>(
        `/instructor/courses/${courseId}/sections/${sectionId}/lessons`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      sectionId,
      lessonId,
      data,
    }: {
      courseId: string;
      sectionId: string;
      lessonId: string;
      data: UpdateLessonData;
    }) => {
      return apiClient.patch<Lesson>(
        `/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
        data,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

export function useDeleteLesson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      sectionId,
      lessonId,
    }: {
      courseId: string;
      sectionId: string;
      lessonId: string;
    }) => {
      return apiClient.delete<{ message: string }>(
        `/instructor/courses/${courseId}/sections/${sectionId}/lessons/${lessonId}`,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

export function useReorderLessons() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      courseId,
      ordering,
    }: {
      courseId: string;
      ordering: Array<{ id: string; sectionId: string; order: number }>;
    }) => {
      return apiClient.patch<{ message: string }>(
        `/instructor/courses/${courseId}/lessons/order`,
        { ordering },
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["instructor", "course", variables.courseId],
      });
    },
  });
}

// Media management
export function useCreateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateMediaData) => {
      return apiClient.post<Media>("/instructor/courses/media", data);
    },
    onSuccess: () => {
      // Invalidate all instructor courses since media can be in any course
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
  });
}

export function useUpdateMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mediaId,
      data,
    }: {
      mediaId: string;
      data: UpdateMediaData;
    }) => {
      return apiClient.patch<Media>(
        `/instructor/courses/media/${mediaId}`,
        data,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
  });
}

export function useDeleteMedia() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (mediaId: string) => {
      return apiClient.delete<{ message: string }>(
        `/instructor/courses/media/${mediaId}`,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instructor", "courses"] });
    },
  });
}

// Type definitions (simplified - you may need to adjust based on your actual types)
type Course = {
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
};

type CourseDetail = Course & {
  sections: Section[];
};

type EnrolledCourse = Course & {
  completed: boolean;
};

type InstructorCourse = Course;

type InstructorCourseDetail = InstructorCourse & {
  sections: Section[];
};

type CreateCourseData = {
  title: string;
  description: string;
  conceptIds: string[];
  published: boolean;
};

type UpdateCourseData = CreateCourseData;

type Concept = {
  id: string;
  name: string;
  slug: string;
  description: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
};

type ConceptWithRelations = Concept & {
  conceptSource: unknown[];
  conceptTarget: unknown[];
  completedLessons: unknown[];
};

type Profile = {
  id?: string;
  email?: string;
  username?: string;
  name?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Certificate = {
  id: string;
  userId: string;
  courseId: string;
  studentDid: string;
  issuerDid: string;
  vcJson: unknown;
  vcHash: string;
  nftAddress: string | null;
  createdAt: unknown;
  course: {
    id: string;
    title: string;
    description: string;
  };
};

type LessonProgress = {
  id: string;
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type Section = {
  id: string;
  title: string;
  description: string;
  order: number;
  conceptIds: string[];
  lessons?: Lesson[];
};

type CreateSectionData = {
  title: string;
  description: string;
  conceptIds: string[];
};

type UpdateSectionData = CreateSectionData;

type Lesson = {
  id: string;
  title: string;
  description: string;
  content: string | null;
  order: number;
  conceptIds: string[];
  media?: Media[];
};

type CreateLessonData = {
  title: string;
  description: string;
  content?: string | null;
  conceptIds: string[];
};

type UpdateLessonData = CreateLessonData;

type Media = {
  id: string;
  title: string;
  description: string;
  mediaType: string;
  url: string;
  lessonId: string;
};

type CreateMediaData = {
  title: string;
  description: string;
  mediaType: string;
  lessonId: string;
  url: string;
};

type UpdateMediaData = CreateMediaData;
