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

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {
    isAuthenticated,
    hasRole,
    isLoading: authLoading,
    accessToken,
  } = useAuth();
  const router = useRouter();
  const [courseId, setCourseId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseData | null>(null);
  const [concepts, setConcepts] = useState<ConceptType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    params.then((p) => setCourseId(p.id));
  }, [params]);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !hasRole("INSTRUCTOR"))) {
      router.push("/");
    }
  }, [isAuthenticated, hasRole, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!courseId || !accessToken) return;

      try {
        setDataLoading(true);
        const [courseData, conceptsData] = await Promise.all([
          apiClient.getInstructorCourse(courseId, accessToken),
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
        setDataLoading(false);
      }
    };

    if (isAuthenticated && hasRole("INSTRUCTOR") && courseId && accessToken) {
      fetchData();
    }
  }, [isAuthenticated, hasRole, courseId, accessToken]);

  const handleCourseSubmit = async (data: CourseFormData) => {
    if (!courseId || !accessToken) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const updatedCourse = await apiClient.updateCourse(
        courseId,
        data,
        accessToken,
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

  if (authLoading || dataLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole("INSTRUCTOR")) {
    return null;
  }

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

  if (!course) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
      <Navbar />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-16 sm:px-6 lg:px-8">
        {/* Course Basic Information */}
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

        {/* Course Structure */}
        <div className="rounded-lg border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <CourseStructure
            courseId={courseId || ""}
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
