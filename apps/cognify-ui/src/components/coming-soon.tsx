import React from "react";

interface CourseCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  iconBgColor: string;
  conceptsCount: number;
}

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  courses?: CourseCard[];
  className?: string;
}

const defaultCourses: CourseCard[] = [
  {
    id: "data-science",
    title: "Data Science Fundamentals",
    description:
      "Connect statistics, programming, and domain expertise in one comprehensive learning graph.",
    icon: (
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
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    iconBgColor: "bg-blue-600",
    conceptsCount: 12,
  },
  {
    id: "web-development",
    title: "Modern Web Development",
    description:
      "Navigate the web ecosystem from HTML fundamentals to advanced frameworks.",
    icon: (
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
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    iconBgColor: "bg-green-600",
    conceptsCount: 18,
  },
  {
    id: "machine-learning",
    title: "Machine Learning Essentials",
    description:
      "Understand ML through the lens of mathematics, statistics, and practical implementation.",
    icon: (
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
          d="M13 10V3L4 14h7v7l9-11h-7z"
        />
      </svg>
    ),
    iconBgColor: "bg-purple-600",
    conceptsCount: 15,
  },
];

export function ComingSoon({
  title = "Popular Learning Paths",
  subtitle = "Explore knowledge graphs across different domains",
  courses = defaultCourses,
  className = "",
}: ComingSoonProps) {
  return (
    <section className={`bg-gray-50 py-20 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">{title}</h2>
          <p className="text-lg text-gray-600">{subtitle}</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="cursor-pointer rounded-lg border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${course.iconBgColor}`}
              >
                {course.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {course.title}
              </h3>
              <p className="mb-4 text-sm text-gray-600">{course.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <span className="mr-2 rounded-full bg-gray-100 px-2 py-1">
                  {course.conceptsCount} concepts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
