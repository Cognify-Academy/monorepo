"use client";

import { MyActiveCourses } from "@/components/my-active-courses";
import { Navbar } from "@/components/navbar";
import { useAuth } from "@/contexts/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function InstructorCoursesPage() {
  const { isAuthenticated, hasRole, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !hasRole("INSTRUCTOR"))) {
      router.push("/");
    }
  }, [isAuthenticated, hasRole, authLoading, router]);

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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <MyActiveCourses context="instructor" />
    </div>
  );
}
