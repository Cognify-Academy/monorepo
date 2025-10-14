"use client";

import { useAuth } from "@/contexts/auth";
import { apiClient, ApiError } from "@/lib/api";
import Link from "next/link";
import { useCallback, useEffect, useState, useRef } from "react";

interface Course {
  id: string;
  title: string;
  description: string;
  completedConcepts: number;
  totalConcepts: number;
  estimatedTimeLeft: string;
  iconColor: string;
  iconPath: string;
  isCompleted: boolean;
}

interface InstructorCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  instructors: Array<{ id: string }>;
  conceptIds: string[];
}

interface MyActiveCoursesProps {
  courses?: Course[];
  context?: "student" | "instructor";
}

const defaultCourses: Course[] = [
  {
    id: "1",
    title: "Data Science Fundamentals",
    description:
      "Continue your exploration of statistics, programming, and data analysis.",
    completedConcepts: 6,
    totalConcepts: 12,
    estimatedTimeLeft: "2 weeks left",
    iconColor: "bg-blue-600",
    iconPath:
      "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    isCompleted: false,
  },
  {
    id: "2",
    title: "Modern Web Development",
    description: "Currently working on advanced JavaScript frameworks.",
    completedConcepts: 10,
    totalConcepts: 18,
    estimatedTimeLeft: "4 weeks left",
    iconColor: "bg-green-600",
    iconPath:
      "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    isCompleted: false,
  },
  {
    id: "3",
    title: "Machine Learning Essentials",
    description: "Explore your next concept in supervised learning models.",
    completedConcepts: 3,
    totalConcepts: 15,
    estimatedTimeLeft: "7 weeks left",
    iconColor: "bg-purple-600",
    iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
    isCompleted: false,
  },
  {
    id: "4",
    title: "Introduction to Algorithms",
    description:
      "You've successfully completed this course! Review concepts or explore related paths.",
    completedConcepts: 10,
    totalConcepts: 10,
    estimatedTimeLeft: "Completed!",
    iconColor: "bg-gray-400",
    iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
    isCompleted: true,
  },
];

const instructorColors = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-red-600",
  "bg-yellow-600",
  "bg-indigo-600",
  "bg-pink-600",
  "bg-teal-600",
];

const instructorIcons = [
  "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "M13 10V3L4 14h7v7l9-11h-7z",
  "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
];

function transformInstructorCourse(
  course: InstructorCourse,
  index: number,
): Course {
  const colorIndex = index % instructorColors.length;
  const iconIndex = index % instructorIcons.length;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    completedConcepts: course.conceptIds.length, // Use concept count as a proxy
    totalConcepts: Math.max(course.conceptIds.length, 5), // Ensure there's always room for more
    estimatedTimeLeft: course.published ? "Published" : "Draft",
    iconColor: instructorColors[colorIndex],
    iconPath: instructorIcons[iconIndex],
    isCompleted: course.published,
  };
}

export function MyActiveCourses({
  courses,
  context = "student",
}: MyActiveCoursesProps) {
  const { isAuthenticated, accessToken, hasRole } = useAuth();
  const [dynamicCourses, setDynamicCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFetched = useRef(false);

  const fetchInstructorCourses = useCallback(async () => {
    if (!accessToken) return;

    setIsLoading(true);
    setError(null);

    try {
      const instructorCourses =
        await apiClient.getInstructorCourses(accessToken);
      const transformedCourses = instructorCourses.map((course, index) =>
        transformInstructorCourse(course, index),
      );
      setDynamicCourses(transformedCourses);
    } catch (error) {
      console.error("Failed to fetch instructor courses:", error);
      if (error instanceof ApiError && error.status === 401) {
        setError("You don't have permission to access instructor courses.");
      } else {
        setError("Failed to load courses. Please try again.");
      }
      setDynamicCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    // Only fetch courses if we have all required authentication state and haven't fetched yet
    if (
      context === "instructor" &&
      isAuthenticated &&
      accessToken &&
      hasRole("INSTRUCTOR") &&
      !hasFetched.current
    ) {
      hasFetched.current = true;
      fetchInstructorCourses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context, isAuthenticated, accessToken, hasRole]);

  const getProgressPercentage = (completed: number, total: number) => {
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (course: Course) => {
    if (course.isCompleted) return "bg-gray-400";
    return course.iconColor.replace("bg-", "bg-");
  };

  const coursesToDisplay =
    courses || (context === "instructor" ? dynamicCourses : defaultCourses);

  const getTitle = () => {
    switch (context) {
      case "instructor":
        return "My Courses";
      default:
        return "My Active Courses";
    }
  };

  const getSubtitle = () => {
    switch (context) {
      case "instructor":
        return "Manage your published and draft courses";
      default:
        return "Pick up where you left off or start a new path!";
    }
  };

  if (context === "instructor" && isLoading) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              {getTitle()}
            </h2>
            <p className="text-lg text-gray-600">{getSubtitle()}</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        </div>
      </section>
    );
  }

  if (context === "instructor" && error) {
    return (
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              {getTitle()}
            </h2>
            <p className="text-lg text-gray-600">{getSubtitle()}</p>
          </div>
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
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            {getTitle()}
          </h2>
          <p className="text-lg text-gray-600">{getSubtitle()}</p>
        </div>
        {coursesToDisplay.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-gray-600">
              {context === "instructor"
                ? "You haven't created any courses yet. Start by creating your first course!"
                : "No courses available."}
            </p>
            {context === "instructor" && (
              <Link
                href="/instructor/courses/new"
                className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Create your first course
              </Link>
            )}
          </div>
        ) : (
          <div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            data-testid="courses-list"
          >
            {coursesToDisplay.map((course) => (
              <div
                key={course.id}
                data-testid="course-card"
                className="cursor-pointer rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                onClick={() => {
                  if (context === "instructor") {
                    window.location.href = `/instructor/courses/${course.id}`;
                  }
                }}
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
                <h3
                  className="mb-2 text-lg font-semibold text-gray-900"
                  data-testid="course-title"
                >
                  {course.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {course.description}
                </p>
                <div className="mb-2 flex items-center text-sm text-gray-500">
                  <span className="mr-2 rounded-full bg-gray-100 px-2 py-1">
                    {context === "instructor"
                      ? `${course.completedConcepts} concepts`
                      : `${course.completedConcepts}/${course.totalConcepts} concepts complete`}
                  </span>
                  <span>
                    {context === "instructor"
                      ? course.estimatedTimeLeft
                      : `Est. ${course.estimatedTimeLeft}`}
                  </span>
                </div>
                {context !== "instructor" && (
                  <div className="h-2.5 w-full rounded-full bg-gray-200">
                    <div
                      className={`h-2.5 rounded-full ${getProgressColor(course)}`}
                      style={{
                        width: `${getProgressPercentage(course.completedConcepts, course.totalConcepts)}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
