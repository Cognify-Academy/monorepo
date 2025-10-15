"use client";

import Footer from "@/components/footer";
import { MyActiveCourses } from "@/components/my-active-courses";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InstructorCoursesPage() {
  const { isAuthenticated, hasRole, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log("Instructor courses page - auth state:", {
      authLoading,
      isAuthenticated,
      hasInstructorRole: hasRole("INSTRUCTOR"),
    });

    if (!authLoading && (!isAuthenticated || !hasRole("INSTRUCTOR"))) {
      console.log("Redirecting to home page due to auth failure");
      router.push("/");
    }
  }, [isAuthenticated, hasRole, authLoading, router]);

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
      <MyActiveCourses context="instructor" />
      <Footer />
    </div>
  );
}
