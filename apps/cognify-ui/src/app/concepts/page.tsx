"use client";

import { ConceptGraphViewer } from "@/components/concept-graph-viewer";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { useConceptsFromCompletedLessons } from "@/lib/api-hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function MyConceptsPage() {
  const { isAuthenticated, isInitialized } = useAuth();
  const router = useRouter();
  const {
    data: conceptsData,
    isLoading,
    error: queryError,
  } = useConceptsFromCompletedLessons();

  // Guard: Redirect unauthenticated users to home
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push("/");
    }
  }, [isInitialized, isAuthenticated, router]);

  // Guard: Don't render if not authenticated
  if (!isInitialized || !isAuthenticated) {
    return null;
  }

  const concepts = conceptsData?.concepts || [];
  const error = queryError
    ? (queryError as Error).message || "Failed to load concepts"
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-800">
      <Navbar />

      <main className="w-full flex-1">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        )}

        {error && (
          <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 transform rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!isLoading && !error && concepts.length === 0 && (
          <div className="absolute left-1/2 top-20 z-50 -translate-x-1/2 transform rounded-md bg-blue-50 p-4">
            <p className="text-sm text-blue-700">
              Complete some lessons to see the concepts you&apos;ve learned
              here.
            </p>
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
