"use client";

import { useCourses } from "@/lib/api-hooks";
import { useMemo } from "react";

interface ComingSoonCourse {
  id: string;
  title: string;
  description: string;
  iconColor: string;
  iconPath: string;
  conceptCount: number;
  estimatedDuration: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  conceptIds?: string[];
  published: boolean;
}

interface ComingSoonCoursesProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const comingSoonColors = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-red-600",
  "bg-yellow-600",
  "bg-indigo-600",
  "bg-pink-600",
  "bg-teal-600",
];

const comingSoonIcons = [
  "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "M13 10V3L4 14h7v7l9-11h-7z",
  "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
];

function transformComingSoonCourse(
  course: Course,
  index: number,
): ComingSoonCourse {
  const colorIndex = index % comingSoonColors.length;
  const iconIndex = index % comingSoonIcons.length;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    iconColor: comingSoonColors[colorIndex],
    iconPath: comingSoonIcons[iconIndex],
    conceptCount: course.conceptIds?.length || 0,
    estimatedDuration: `${Math.max(course.conceptIds?.length || 5, 5)}-${Math.max(course.conceptIds?.length || 5, 5) + 2} weeks`,
  };
}

export function ComingSoonCourses({
  title = "Coming Soon",
  subtitle = "Exciting new courses in development",
  className = "",
}: ComingSoonCoursesProps) {
  // Use React Query hook for courses
  const { data: allCoursesData, isLoading, error: queryError } = useCourses();

  // Filter and transform courses data
  const courses = useMemo<ComingSoonCourse[]>(() => {
    if (!allCoursesData) return [];
    return allCoursesData
      .filter((course) => !course.published)
      .map((course, index) => transformComingSoonCourse(course, index));
  }, [allCoursesData]);

  const error = queryError
    ? (queryError as Error).message || "Failed to load coming soon courses"
    : null;

  if (isLoading) {
    return (
      <section className={`bg-gray-50 py-20 dark:bg-gray-800 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading coming soon courses...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`bg-gray-50 py-20 dark:bg-gray-800 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              {subtitle}
            </p>
          </div>
          <div className="rounded-md border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`bg-gray-50 py-20 dark:bg-gray-800 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">{subtitle}</p>
        </div>
        {courses.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No courses coming soon at the moment. Check back later!
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className="rounded-lg border border-gray-100 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <div
                  className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${course.iconColor}`}
                >
                  <svg
                    className="h-5 w-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={course.iconPath}
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {course.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                  {course.description}
                </p>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <span className="mr-2 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-700">
                    {course.conceptCount} concepts
                  </span>
                  <span>{course.estimatedDuration}</span>
                </div>
                <div className="mt-4">
                  <span className="rounded-lg bg-gray-300 px-4 py-2 text-sm font-semibold text-gray-500 dark:bg-gray-600 dark:text-gray-400">
                    Coming Soon
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
