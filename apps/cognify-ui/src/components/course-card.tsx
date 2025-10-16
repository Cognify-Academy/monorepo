import { ClockIcon } from "@/icons/clock-icon";
import { UsersIcon } from "@/icons/users-icon";
import { type Course } from "@/services/courses";
import Link from "next/link";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group block rounded-xl border border-gray-200 p-6 transition-all duration-200 hover:border-gray-300 hover:shadow-md dark:border-gray-700 dark:hover:border-gray-600"
    >
      <div className="flex flex-col space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
            {course.title}
          </h3>
          <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">
            {course.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <UsersIcon className="h-4 w-4" />
              <span>
                {course.instructors.length} instructor
                {course.instructors.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <ClockIcon className="h-4 w-4" />
            <span>{new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Published
          </span>

          <span className="text-sm font-medium text-blue-600 group-hover:text-blue-700 dark:text-blue-400 dark:group-hover:text-blue-300">
            View Course →
          </span>
        </div>
      </div>
    </Link>
  );
}
