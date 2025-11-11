"use client";

import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import ReadyToLearn from "@/components/ready-to-learn";
import { useAuth } from "@/contexts/auth";
import {
  useCourses,
  useEnrollInCourse,
  useStudentCourses,
} from "@/lib/api-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  slug: string;
  published: boolean;
}

export default function PublicCoursesPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Use React Query hooks
  const {
    data: coursesData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useCourses();

  const { data: enrolledCoursesData, isLoading: enrolledLoading } =
    useStudentCourses(isAuthenticated);

  const enrollInCourse = useEnrollInCourse();

  // Transform courses data
  const courses = useMemo<Course[]>(() => {
    return coursesData || [];
  }, [coursesData]);

  // Transform enrolled courses data
  const enrolledCourses = useMemo<Course[]>(() => {
    return enrolledCoursesData || [];
  }, [enrolledCoursesData]);

  const isEnrolledInCourse = (courseId: string) => {
    return enrolledCourses.some((course) => course.id === courseId);
  };

  const handleEnroll = async (courseId: string) => {
    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }

    const course = courses.find((c) => c.id === courseId);
    if (!course) {
      return;
    }

    try {
      await enrollInCourse.mutateAsync(course.slug);
      // Redirect to the course page after successful enrollment
      router.push(`/courses/${course.slug}`);
    } catch (error: unknown) {
      console.error("Enrollment failed:", error);
      // Error is handled by React Query
    }
  };

  const loading = coursesLoading || enrolledLoading;
  const enrolling =
    enrollInCourse.isPending && enrollInCourse.variables
      ? enrollInCourse.variables
      : null;
  const error = coursesError
    ? (coursesError as Error).message || "Failed to load courses"
    : enrollInCourse.error
      ? (enrollInCourse.error as Error).message || "Failed to enroll in course"
      : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="mx-auto max-w-7xl bg-gray-50 px-4 py-12 text-gray-800 dark:bg-gray-900 dark:text-gray-200 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading courses...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            Available Courses
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600 dark:text-gray-400">
            Explore our knowledge graph-based courses. Sign up to start your
            learning journey.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {courses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <svg
                className="h-6 w-6 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
              No courses available yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              We&apos;re working on adding more courses. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={
                  course.published ? `/courses/preview/${course.slug}` : "#"
                }
                className={`block rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md ${
                  course.published
                    ? "cursor-pointer border-gray-100 bg-white dark:border-gray-700 dark:bg-gray-800"
                    : "cursor-default border-yellow-200 bg-yellow-50 dark:border-yellow-700 dark:bg-yellow-900/20"
                }`}
                onClick={(e) => {
                  // Prevent navigation if clicking on buttons or nested links, or if course is not published
                  const target = e.target as HTMLElement;
                  const isButton = target.closest("button");
                  const isNestedLink =
                    target.closest("a") &&
                    target.closest("a") !== e.currentTarget;

                  if (!course.published || isButton || isNestedLink) {
                    e.preventDefault();
                  }
                }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {course.title}
                  </h3>
                  {!course.published && (
                    <span className="ml-2 rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200">
                      Draft
                    </span>
                  )}
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">
                  {course.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    <span className="rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">
                      Course
                    </span>
                  </div>
                  {course.published ? (
                    isEnrolledInCourse(course.id) ? (
                      <Link
                        href={`/courses/${course.slug}`}
                        className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Resume Course
                      </Link>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleEnroll(course.id);
                        }}
                        disabled={enrolling === course.slug}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:disabled:bg-blue-400"
                      >
                        {enrolling === course.slug
                          ? "Enrolling..."
                          : "Enroll Now"}
                      </button>
                    )
                  ) : (
                    <span className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-600 dark:text-gray-400">
                      Coming Soon
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        <ReadyToLearn />
      </main>
      <Footer />
    </div>
  );
}
