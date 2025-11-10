"use client";

import { type ConceptType } from "@/components/concept-selector";
import { CourseForm, type CourseFormData } from "@/components/course-form";
import {
  CourseStructure,
  type Media,
  type Section,
} from "@/components/course-structure";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import {
  useConcepts,
  useInstructorCourse,
  useUpdateCourse,
} from "@/lib/api-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  conceptIds: string[];
  published: boolean;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export default function EditCoursePage({ params }: { params: { id: string } }) {
  const { isAuthenticated, hasRole, isInitialized } = useAuth();
  const router = useRouter();

  // Use React Query hooks for data fetching
  const {
    data: courseData,
    isLoading: courseLoading,
    error: courseError,
  } = useInstructorCourse(params.id, isAuthenticated && hasRole("INSTRUCTOR"));

  const {
    data: conceptsData,
    isLoading: conceptsLoading,
  } = useConcepts();

  const updateCourse = useUpdateCourse();

  // Check auth and redirect if not authorized
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || !hasRole("INSTRUCTOR")) {
      router.push("/");
    }
  }, [isInitialized, isAuthenticated, hasRole, router]);

  // Transform course data
  const transformedCourse = useMemo<CourseData | null>(() => {
    if (!courseData) return null;

    return {
      ...courseData,
      sections: courseData.sections.map((section) => ({
        ...section,
        conceptIds: section.conceptIds || [],
        lessons: section.lessons.map((lesson) => ({
          ...lesson,
          conceptIds: lesson.conceptIds || [],
          media: (lesson.media || []) as Media[],
        })),
      })),
    };
  }, [courseData]);

  // Maintain local state for sections to prevent refetches from overwriting user input
  const [localSections, setLocalSections] = useState<Section[] | null>(null);

  // Update local sections when course data changes (initial load or when sections actually change)
  useEffect(() => {
    if (transformedCourse?.sections) {
      // Only update if local sections haven't been set yet (initial load)
      // or if the sections have actually changed (e.g., new section added, section deleted)
      // This prevents overwriting user input while they're typing
      if (localSections === null) {
        setLocalSections(transformedCourse.sections);
      } else {
        // Only update if the number of sections changed (new section added/deleted)
        // or if section IDs changed (sections reordered)
        const localSectionIds = localSections.map((s) => s.id).sort().join(",");
        const newSectionIds = transformedCourse.sections
          .map((s) => s.id)
          .sort()
          .join(",");
        if (localSectionIds !== newSectionIds) {
          setLocalSections(transformedCourse.sections);
        }
      }
    }
  }, [transformedCourse?.sections, localSections]);

  // Use local sections if available, otherwise use transformed course sections
  const course = useMemo<CourseData | null>(() => {
    if (!transformedCourse) return null;

    return {
      ...transformedCourse,
      sections: localSections || transformedCourse.sections,
    };
  }, [transformedCourse, localSections]);

  // Transform concepts data
  const concepts = useMemo<ConceptType[]>(() => {
    return conceptsData || [];
  }, [conceptsData]);

  const handleCourseSubmit = async (data: CourseFormData) => {
    try {
      await updateCourse.mutateAsync({
        id: params.id,
        data,
      });
    } catch (error: unknown) {
      console.error("Failed to update course:", error);
      // Error is handled by React Query
    }
  };

  const handleSectionsChange = (sections: Section[]) => {
    // Update local state immediately to prevent refetches from overwriting user input
    setLocalSections(sections);
  };

  const isLoading = courseLoading || conceptsLoading || updateCourse.isPending;
  const error = courseError
    ? (courseError as Error).message || "Failed to load course data. Please try again."
    : updateCourse.error
      ? (updateCourse.error as Error).message || "Failed to update course. Please try again."
      : null;

  // Show loading while initializing or loading course data
  if (!isInitialized || (isLoading && !course)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if course failed to load
  if (error && !course) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
        <Navbar />
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render if no course data
  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
      <Navbar />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        {/* Course Basic Information */}
        <div data-testid="course-form">
          <CourseForm
            initialData={{
              title: course.title,
              description: course.description,
              conceptIds: course.conceptIds,
              published: course.published,
            }}
            availableConcepts={concepts}
            onSubmit={handleCourseSubmit}
            isLoading={isLoading}
            isEditing={true}
            error={error}
          />
        </div>

        {/* Course Structure */}
        <div
          className="rounded-lg border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800"
          data-testid="course-structure"
        >
          <CourseStructure
            courseId={params.id}
            sections={course.sections}
            onSectionsChange={handleSectionsChange}
            availableConcepts={concepts}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
