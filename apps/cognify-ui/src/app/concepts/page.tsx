"use client";

import { ConceptGraphViewer } from "@/components/concept-graph-viewer";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { useConceptsFromCompletedLessons } from "@/lib/api-hooks";
import { useMemo } from "react";

interface Concept {
  id: string;
  name: string;
  slug: string;
  description: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
  conceptSource: Array<{
    id: string;
    conceptSourceId: string;
    conceptTargetId: string;
    description: string;
    weighting?: number;
  }>;
  conceptTarget: Array<{
    id: string;
    conceptSourceId: string;
    conceptTargetId: string;
    description: string;
    weighting?: number;
  }>;
  completedLessons: Array<{
    lessonId: string;
    lessonTitle: string;
    completedAt?: string;
  }>;
}

export default function MyConceptsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Use React Query hook for concepts from completed lessons
  const {
    data: conceptsData,
    isLoading,
    error: queryError,
  } = useConceptsFromCompletedLessons();

  // Transform concepts data
  const concepts = useMemo<Concept[]>(() => {
    if (!conceptsData?.concepts) return [];
    // Map ConceptWithRelations to Concept format
    return conceptsData.concepts.map((concept) => ({
      id: concept.id,
      name: concept.name,
      slug: concept.slug,
      description: concept.description,
      importance: concept.importance,
      createdAt: concept.createdAt,
      updatedAt: concept.updatedAt,
      conceptSource: (Array.isArray(concept.conceptSource)
        ? concept.conceptSource
        : []) as Concept["conceptSource"],
      conceptTarget: (Array.isArray(concept.conceptTarget)
        ? concept.conceptTarget
        : []) as Concept["conceptTarget"],
      completedLessons: (Array.isArray(concept.completedLessons)
        ? concept.completedLessons
        : []) as Concept["completedLessons"],
    }));
  }, [conceptsData]);

  const error = queryError
    ? (queryError as Error).message ||
      "Failed to load concepts. Please try again."
    : null;

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

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Please log in to view your concepts
          </h1>
          <p className="mt-2 text-gray-600">
            You need to be logged in to see concepts from your completed
            lessons.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />

      <main className="w-full flex-1">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading your concepts...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 transform rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && concepts.length === 0 && (
          <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 transform rounded-md bg-blue-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  No concepts yet
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Complete some lessons to see the concepts you&apos;ve
                    learned here.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && concepts.length > 0 && (
          <ConceptGraphViewer concepts={concepts} />
        )}
      </main>

      <Footer />
    </div>
  );
}
