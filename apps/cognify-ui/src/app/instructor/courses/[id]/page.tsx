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
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  // use getAccessToken so we can await a refresh if needed
  const { isAuthenticated, hasRole, isInitialized, getAccessToken } = useAuth();
  const router = useRouter();
  const [course, setCourse] = useState<CourseData | null>(null);
  const [concepts, setConcepts] = useState<ConceptType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  // NOTE: removed the immediate redirect useEffect because it ran before an async refresh could complete.
  // Instead we attempt to get a valid token and only redirect if auth fails after refresh.

  // Fetch course data
  useEffect(() => {
    const fetchData = async () => {
      // attempt to obtain a valid token (will refresh if expired)
      const token = await getAccessToken();

      // after refresh attempt, check auth/role and redirect if unauthorized
      if (!token || !isAuthenticated || !hasRole("INSTRUCTOR")) {
        // If initialization not yet finished, avoid immediate redirect; rely on caller to handle UI.
        if (isInitialized) {
          router.push("/");
        }
        return;
      }

      try {
        const [courseData, conceptsData] = await Promise.all([
          apiClient.getInstructorCourse(params.id, token),
          apiClient.getConcepts(),
        ]);

        const transformedCourse: CourseData = {
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

        setCourse(transformedCourse);
        setConcepts(conceptsData);
      } catch (error) {
        console.error("Failed to fetch course data:", error);
        setError("Failed to load course data. Please try again.");
      } finally {
        setDataLoaded(true);
      }
    };

    fetchData();
  }, [
    getAccessToken,
    isAuthenticated,
    hasRole,
    isInitialized,
    params.id,
    router,
  ]);

  const handleCourseSubmit = async (data: CourseFormData) => {
    const token = await getAccessToken();
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCourse = await apiClient.updateCourse(
        params.id,
        data,
        token,
      );
      setCourse((prev) => (prev ? { ...prev, ...updatedCourse } : null));
    } catch (error: unknown) {
      console.error("Failed to update course:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to update course. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionsChange = (sections: Section[]) => {
    if (course) {
      setCourse({ ...course, sections });
    }
  };

  // Show loading while auth is initializing or data is loading
  if (!isInitialized || (!dataLoaded && !error)) {
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
