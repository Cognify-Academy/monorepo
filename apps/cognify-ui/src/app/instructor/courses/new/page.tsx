"use client";

import { type ConceptType } from "@/components/concept-selector";
import { CourseForm, type CourseFormData } from "@/components/course-form";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NewCoursePage() {
  const {
    isAuthenticated,
    hasRole,
    isLoading: authLoading,
    accessToken,
  } = useAuth();
  const router = useRouter();
  const [concepts, setConcepts] = useState<ConceptType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conceptsLoading, setConceptsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !hasRole("INSTRUCTOR"))) {
      router.push("/");
    }
  }, [isAuthenticated, hasRole, authLoading, router]);

  // Fetch concepts
  useEffect(() => {
    const fetchConcepts = async () => {
      try {
        setConceptsLoading(true);
        const fetchedConcepts = await apiClient.getConcepts();
        setConcepts(fetchedConcepts);
      } catch (error) {
        console.error("Failed to fetch concepts:", error);
        setError("Failed to load concepts. Please try again.");
      } finally {
        setConceptsLoading(false);
      }
    };

    if (isAuthenticated && hasRole("INSTRUCTOR")) {
      fetchConcepts();
    }
  }, [isAuthenticated, hasRole]);

  const handleSubmit = async (data: CourseFormData) => {
    if (!accessToken) {
      setError("Authentication required. Please log in again.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const createdCourse = await apiClient.createCourse(data, accessToken);
      // Redirect to the course edit page
      router.push(`/instructor/courses/${createdCourse.id}`);
    } catch (error: unknown) {
      console.error("Failed to create course:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create course. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900">
      <Navbar />
      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {conceptsLoading ? (
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading concepts...</p>
          </div>
        ) : (
          <CourseForm
            availableConcepts={concepts}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
          />
        )}
      </section>
    </div>
  );
}
