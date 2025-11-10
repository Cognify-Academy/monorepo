"use client";

import { useAuth } from "@/contexts/auth";
import { useCertificates, useStudentCourses } from "@/lib/api-hooks";
import Link from "next/link";
import { useMemo } from "react";
import { CertificateRequest } from "./certificate-request";

interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  description: string;
  iconColor: string;
  iconPath: string;
  conceptCount: number;
  progressPercentage: number;
  estimatedTimeLeft: string;
  completed: boolean;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  conceptIds?: string[];
  completed: boolean;
}

interface EnrolledCoursesProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

const enrolledColors = [
  "bg-green-600",
  "bg-blue-600",
  "bg-purple-600",
  "bg-red-600",
  "bg-yellow-600",
  "bg-indigo-600",
  "bg-pink-600",
  "bg-teal-600",
];

const enrolledIcons = [
  "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
  "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
  "M13 10V3L4 14h7v7l9-11h-7z",
  "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
  "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
  "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
];

function transformEnrolledCourse(
  course: Course,
  index: number,
): EnrolledCourse {
  const colorIndex = index % enrolledColors.length;
  const iconIndex = index % enrolledIcons.length;

  // Use completed status from API, or mock progress for testing
  const progressPercentage = course.completed
    ? 100
    : Math.floor(Math.random() * 100);
  const conceptCount = course.conceptIds?.length || 0;

  // Estimate time left based on progress
  const estimatedTimeLeft =
    progressPercentage === 100
      ? "Completed!"
      : progressPercentage > 75
        ? "1-2 weeks left"
        : progressPercentage > 50
          ? "3-4 weeks left"
          : progressPercentage > 25
            ? "5-6 weeks left"
            : "7-8 weeks left";

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    iconColor: enrolledColors[colorIndex],
    iconPath: enrolledIcons[iconIndex],
    conceptCount,
    progressPercentage,
    estimatedTimeLeft,
    completed: course.completed,
  };
}

export function EnrolledCourses({
  title = "My Enrolled Courses",
  subtitle = "Continue your learning journey",
  className = "",
}: EnrolledCoursesProps) {
  const { isAuthenticated, user } = useAuth();

  // Use React Query hooks for data fetching
  const {
    data: enrolledData,
    isLoading: coursesLoading,
    error: coursesError,
  } = useStudentCourses();

  const {
    data: certificatesData,
    isLoading: certificatesLoading,
    refetch: refetchCertificates,
  } = useCertificates(user?.id || "", !!user?.id);

  // Transform courses data
  const courses = useMemo(() => {
    if (!enrolledData) return [];
    return enrolledData.map((course, index) =>
      transformEnrolledCourse(
        {
          id: course.id,
          title: course.title,
          slug: course.slug,
          description: course.description,
          conceptIds: course.conceptIds,
          completed: course.completed,
        },
        index,
      ),
    );
  }, [enrolledData]);

  // Create certificate map
  const certificates = useMemo(() => {
    const certificateMap = new Map<
      string,
      { nftAddress: string | null; vcHash: string }
    >();
    if (certificatesData?.certificates) {
      certificatesData.certificates.forEach((cert) => {
        certificateMap.set(cert.courseId, {
          nftAddress: cert.nftAddress,
          vcHash: cert.vcHash,
        });
      });
    }
    return certificateMap;
  }, [certificatesData]);

  const isLoading = coursesLoading || certificatesLoading;
  const error = coursesError
    ? (coursesError as Error).message || "Failed to load enrolled courses"
    : null;

  if (!isAuthenticated) {
    return (
      <section className={`bg-gray-50 py-20 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-lg text-gray-600">{subtitle}</p>
          </div>
          <div className="text-center">
            <p className="text-lg text-gray-600">
              Please sign in to view your enrolled courses
            </p>
            <Link
              href="/signup"
              className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={`bg-gray-50 py-20 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-lg text-gray-600">{subtitle}</p>
          </div>
          <div className="text-center">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              Loading your enrolled courses...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`bg-gray-50 py-20 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">{title}</h2>
            <p className="text-lg text-gray-600">{subtitle}</p>
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
    <section className={`bg-gray-50 py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>
        {courses.length === 0 ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
              <svg
                className="h-6 w-6 text-gray-400"
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
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              No enrolled courses yet
            </h3>
            <p className="mb-4 text-gray-600">
              You haven&apos;t enrolled in any courses yet. Start your learning
              journey!
            </p>
            <Link
              href="/courses"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Browse Available Courses
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md ${
                  !course.completed ? "cursor-pointer" : ""
                }`}
                onClick={
                  !course.completed
                    ? () => {
                        window.location.href = `/courses/${course.slug}`;
                      }
                    : undefined
                }
              >
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${course.iconColor}`}
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
                  <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                    Enrolled
                  </span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {course.title}
                </h3>
                <p className="mb-4 text-sm text-gray-600">
                  {course.description}
                </p>
                <div className="mb-2 flex items-center text-sm text-gray-500">
                  <span className="mr-2 rounded-full bg-gray-100 px-2 py-1">
                    {course.conceptCount} concepts
                  </span>
                  <span>Est. {course.estimatedTimeLeft}</span>
                </div>
                <div className="mb-4 h-2.5 w-full rounded-full bg-gray-200">
                  <div
                    className={`h-2.5 rounded-full ${
                      course.progressPercentage === 100
                        ? "bg-green-600"
                        : course.iconColor
                    }`}
                    style={{
                      width: `${course.progressPercentage}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {course.progressPercentage}% complete
                  </span>
                  {!course.completed && (
                    <Link
                      href={`/courses/${course.slug}`}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                    >
                      Resume Course
                    </Link>
                  )}
                </div>

                {/* Show certificate request or link when course is completed */}
                {course.completed && (
                  <div className="mt-4">
                    <CertificateRequest
                      courseId={course.id}
                      courseTitle={course.title}
                      existingCertificate={certificates.get(course.id)}
                      onSuccess={(data) => {
                        console.log("Certificate issued:", data);
                        // Refresh certificates after successful issuance
                        refetchCertificates();
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
