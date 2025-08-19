import {
  Breadcrumb,
  BreadcrumbHome,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "@/components/breadcrumbs";
import Footer from "@/components/footer";
import { LessonPageClient } from "@/components/lesson-page-client";
import { Navbar } from "@/components/navbar";
import { SidebarLayoutContent } from "@/components/sidebar-layout";
import { Video } from "@/components/video-player";
import { getCourse } from "@/services/courses";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{
    slug: string;
    lessonId: string;
  }>;
}

export default async function LessonPage({ params }: PageProps) {
  const { slug, lessonId } = await params;
  const course = await getCourse(slug);

  if (!course) {
    notFound();
  }

  const lesson = course.sections
    .flatMap((section) => section.lessons)
    .find((l) => l.id === lessonId);

  if (!lesson) {
    notFound();
  }

  const allLessons = course.sections.flatMap((s) => s.lessons);
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  return (
    <div className="bg-gray-50 text-gray-800">
      <Navbar />

      <SidebarLayoutContent
        breadcrumbs={
          <Breadcrumbs>
            <BreadcrumbHome />
            <BreadcrumbSeparator />
            <Breadcrumb href={`/courses/${slug}`}>{course.title}</Breadcrumb>
            <BreadcrumbSeparator />
            <Breadcrumb>{lesson.title}</Breadcrumb>
          </Breadcrumbs>
        }
      >
        <div className="mx-auto mt-6 mb-16 max-w-4xl">
          <div className="mb-12">
            <h1 className="text-3xl/9 font-medium tracking-tight text-gray-950 dark:text-white">
              {lesson.title}
            </h1>
            <p className="mt-4 text-base/7 text-gray-700 dark:text-gray-400">
              {lesson.description}
            </p>
          </div>

          {lesson.media && lesson.media.length > 0 && (
            <div className="mb-8 space-y-4">
              {lesson.media.map((mediaItem) => (
                <div
                  key={mediaItem.id}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                    {mediaItem.title}
                  </h3>
                  {mediaItem.description && (
                    <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                      {mediaItem.description}
                    </p>
                  )}

                  {mediaItem.mediaType === "video" && mediaItem.url && (
                    <Video
                      src={mediaItem.url}
                      poster={mediaItem.metadata?.thumbnail}
                    />
                  )}

                  {mediaItem.mediaType === "image" && mediaItem.url && (
                    <div className="relative">
                      <Image
                        src={mediaItem.url}
                        alt={mediaItem.title}
                        width={800}
                        height={600}
                        className="w-full rounded-lg"
                      />
                    </div>
                  )}

                  {mediaItem.notes && (
                    <div className="mt-4 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        {mediaItem.notes}
                      </p>
                    </div>
                  )}

                  {mediaItem.transcript && (
                    <details className="mt-4">
                      <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300">
                        View Transcript
                      </summary>
                      <div className="mt-2 rounded-md bg-gray-50 p-3 dark:bg-gray-800">
                        <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                          {mediaItem.transcript}
                        </p>
                      </div>
                    </details>
                  )}
                </div>
              ))}
            </div>
          )}

          <LessonPageClient lessonId={lessonId}>
            <div className="prose dark:prose-invert mt-8">
              <div className="whitespace-pre-wrap">
                {typeof lesson.content === "string"
                  ? lesson.content
                  : JSON.stringify(lesson.content, null, 2)}
              </div>
            </div>
          </LessonPageClient>

          <div className="mt-16 border-t border-gray-200 pt-8 dark:border-white/10">
            {nextLesson ? (
              <div className="group relative flex rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="flex min-w-0 flex-1 gap-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 font-medium text-gray-900 dark:text-white">
                      <Link
                        href={`/courses/${slug}/lessons/${nextLesson.id}`}
                        className="hover:underline"
                      >
                        Next: {nextLesson.title}
                      </Link>
                    </p>
                    {nextLesson.description && (
                      <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                        {nextLesson.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-x-4">
                  <div className="hidden sm:flex sm:flex-col sm:items-end">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div className="group relative flex rounded-2xl bg-gray-50 p-4 transition-colors hover:bg-gray-100 dark:bg-white/5 dark:hover:bg-white/10">
                <div className="flex min-w-0 flex-1 gap-x-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-6 font-medium text-gray-900 dark:text-white">
                      <Link href="/courses" className="hover:underline">
                        Back to Courses
                      </Link>
                    </p>
                    <p className="mt-1 text-sm leading-5 text-gray-500 dark:text-gray-400">
                      Explore more courses and continue your learning journey.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarLayoutContent>

      <Footer />
    </div>
  );
}
