"use client";

import {
  Breadcrumb,
  BreadcrumbHome,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "@/components/breadcrumbs";
import { EnrollmentButton } from "@/components/enrollment-button";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SidebarLayoutContent } from "@/components/sidebar-layout";
import { BookIcon } from "@/icons/book-icon";
import { LessonsIcon } from "@/icons/lessons-icon";
import { useCoursePreview } from "@/lib/api-hooks";
import { useParams } from "next/navigation";

export default function CoursePreviewPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: course, isLoading, error } = useCoursePreview(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="mx-auto max-w-7xl bg-gray-50 px-4 py-12 text-gray-800 dark:bg-gray-900 dark:text-gray-200 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Loading course preview...
              </p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="mx-auto max-w-7xl bg-gray-50 px-4 py-12 text-gray-800 dark:bg-gray-900 dark:text-gray-200 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
              Course Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              The course you&apos;re looking for doesn&apos;t exist or is not
              available.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalLessons = course.sections.reduce(
    (sum, section) => sum + section.lessonCount,
    0,
  );

  return (
    <div className="bg-gray-50 text-gray-800 dark:bg-gray-900">
      <Navbar />

      <SidebarLayoutContent
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbHome />
            <BreadcrumbSeparator />
            <Breadcrumb href="/courses">Courses</Breadcrumb>
            <BreadcrumbSeparator />
            <Breadcrumb>{course.title}</Breadcrumb>
          </Breadcrumbs>
        }
      >
        <div className="mx-auto mb-16 mt-6 max-w-4xl">
          <div className="mb-12">
            <h1
              className="text-3xl/9 font-medium tracking-tight text-gray-950 dark:text-white"
              data-testid="course-title"
            >
              {course.title}
            </h1>
            <p
              className="mt-4 text-base/7 text-gray-700 dark:text-gray-400"
              data-testid="course-description"
            >
              {course.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm/7 font-semibold text-gray-950 dark:text-white sm:gap-3">
              <div className="flex items-center gap-1.5">
                <BookIcon className="stroke-gray-950/40 dark:stroke-white/40" />
                {course.sections.length} section
                {course.sections.length !== 1 ? "s" : ""}
              </div>
              <span className="hidden text-gray-950/25 dark:text-white/25 sm:inline">
                &middot;
              </span>
              <div className="flex items-center gap-1.5">
                <LessonsIcon className="stroke-gray-950/40 dark:stroke-white/40" />
                {totalLessons} lesson{totalLessons !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <EnrollmentButton
              courseIdentifier={course.slug}
              courseName={course.title}
              courseId={course.id}
            />
          </div>

          <div className="space-y-12">
            {course.sections.map((section, index) => (
              <div
                key={section.id}
                className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <div className="mb-4">
                  <h2 className="text-xl/7 font-medium tracking-tight text-gray-950 dark:text-white">
                    Section {index + 1}: {section.title}
                  </h2>
                  {section.description && (
                    <p className="mt-2 text-base/7 text-gray-700 dark:text-gray-400">
                      {section.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <LessonsIcon className="h-4 w-4 stroke-gray-600 dark:stroke-gray-400" />
                  <span>
                    {section.lessonCount} lesson
                    {section.lessonCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {course.sections.length === 0 && (
            <div className="py-12 text-center">
              <LessonsIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                No content available
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                This course is still being prepared. Check back later.
              </p>
            </div>
          )}
        </div>
      </SidebarLayoutContent>

      <Footer />
    </div>
  );
}
