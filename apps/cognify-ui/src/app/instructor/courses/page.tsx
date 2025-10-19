"use client";

import Footer from "@/components/footer";
import { MyActiveCourses } from "@/components/my-active-courses";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InstructorCoursesPage() {
  const { isAuthenticated, hasRole, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to initialize
    if (!isInitialized) {
      return;
    }

    // After initialization, check auth and redirect if needed
    if (!isAuthenticated || !hasRole("INSTRUCTOR")) {
      router.push("/");
    }
  }, [isInitialized, isAuthenticated, hasRole, router]);

  // Show loading while auth is initializing
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // After initialization, don't render if not authorized
  if (!isAuthenticated || !hasRole("INSTRUCTOR")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Navbar />
      <MyActiveCourses context="instructor" />
      <Footer />
    </div>
  );
}
