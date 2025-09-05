import {
  Breadcrumb,
  BreadcrumbHome,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "@/components/breadcrumbs";
import { ContentLink } from "@/components/content-link";
import { EnrollmentButton } from "@/components/enrollment-button";
import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import { SidebarLayoutContent } from "@/components/sidebar-layout";
import { BookIcon } from "@/icons/book-icon";
import { LessonsIcon } from "@/icons/lessons-icon";
import { getCourse } from "@/services/courses";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    return {
      title: "Course Not Found",
    };
  }

  return {
    title: `${course.title} - Cognify Academy`,
    description: course.description,
  };
}

export default async function CoursePage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const totalLessons = course.sections.reduce(
    (sum, section) => sum + section.lessons.length,
    0,
  );

  const firstLessonId =
    course.sections.length > 0 && course.sections[0].lessons.length > 0
      ? course.sections[0].lessons[0].id
      : undefined;

  return (
    <div className="bg-gray-50 text-gray-800 dark:bg-gray-900">
      <Navbar />

      <SidebarLayoutContent
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbHome />
            <BreadcrumbSeparator />
            <Breadcrumb>{course.title}</Breadcrumb>
          </Breadcrumbs>
        }
      >
        <div className="mx-auto mt-6 mb-16 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-3xl/9 font-medium tracking-tight text-gray-950 dark:text-white">
              {course.title}
            </h1>
            <p className="mt-4 text-base/7 text-gray-700 dark:text-gray-400">
              {course.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm/7 font-semibold text-gray-950 sm:gap-3 dark:text-white">
              <div className="flex items-center gap-1.5">
                <BookIcon className="stroke-gray-950/40 dark:stroke-white/40" />
                {course.sections.length} section
                {course.sections.length !== 1 ? "s" : ""}
              </div>
              <span className="hidden text-gray-950/25 sm:inline dark:text-white/25">
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
              firstLessonId={firstLessonId}
            />
          </div>

          <div className="space-y-12">
            {course.sections.map((section, index) => (
              <div key={section.id}>
                <div className="mb-6">
                  <h2 className="text-xl/7 font-medium tracking-tight text-gray-950 dark:text-white">
                    Section {index + 1}: {section.title}
                  </h2>
                  {section.description && (
                    <p className="mt-2 text-base/7 text-gray-700 dark:text-gray-400">
                      {section.description}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  {section.lessons.map((lesson) => (
                    <ContentLink
                      key={lesson.id}
                      title={lesson.title}
                      description={lesson.description}
                      href={`/courses/${course.slug}/lessons/${lesson.id}`}
                      type="video"
                    />
                  ))}
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
