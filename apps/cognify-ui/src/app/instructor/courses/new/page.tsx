"use client";

import { type ConceptType } from "@/components/concept-selector";
import { CourseForm, type CourseFormData } from "@/components/course-form";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { useConcepts, useCreateCourse } from "@/lib/api-hooks";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function NewCoursePage() {
  const { isAuthenticated, hasRole, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Use React Query hooks
  const {
    data: conceptsData,
    isLoading: conceptsLoading,
    error: conceptsError,
  } = useConcepts();

  const createCourse = useCreateCourse();

  // Check auth and redirect if not authorized
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !hasRole("INSTRUCTOR"))) {
      router.push("/");
    }
  }, [isAuthenticated, hasRole, authLoading, router]);

  // Transform concepts data
  const concepts = useMemo<ConceptType[]>(() => {
    return conceptsData || [];
  }, [conceptsData]);

  const handleSubmit = async (data: CourseFormData) => {
    try {
      const createdCourse = await createCourse.mutateAsync(data);
      // Redirect to the course edit page
      router.push(`/instructor/courses/${createdCourse.id}`);
    } catch (error: unknown) {
      console.error("Failed to create course:", error);
      // Error is handled by React Query
    }
  };

  const isLoading = createCourse.isPending;
  const error = conceptsError
    ? (conceptsError as Error).message ||
      "Failed to load concepts. Please try again."
    : createCourse.error
      ? (createCourse.error as Error).message ||
        "Failed to create course. Please try again."
      : null;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !hasRole("INSTRUCTOR")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {conceptsLoading ? (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading concepts...
            </p>
          </div>
        ) : (
          <div data-testid="course-form">
            <CourseForm
              availableConcepts={concepts}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        )}
      </section>
      <Footer />
    </div>
  );
}
