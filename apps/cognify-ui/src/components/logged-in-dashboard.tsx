"use client";

import { useAuth } from "@/contexts/auth";
import Link from "next/link";
import Footer from "./footer";
import { MyActiveCourses } from "./my-active-courses";
import { Navbar } from "./navbar";

export function LoggedInDashboard() {
  const { user } = useAuth();

  return (
    <div className="bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-900 md:text-6xl dark:text-white">
            Welcome Back,{" "}
            <span className="text-blue-600 dark:text-blue-400">
              {user?.name}!
            </span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600 dark:text-gray-400">
            Continue your learning journey and explore new connections in your
            knowledge graph.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/courses/enrolled">
              <button className="transform rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                Continue Learning
              </button>
            </Link>
            <Link href="/concepts">
              <button className="flex items-center rounded-lg px-8 py-4 text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200">
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h1m4 0h1M9 16h6M9 8h6"
                  />
                </svg>
                See Your Progress
              </button>
            </Link>
          </div>
        </div>

        <div className="relative mt-20">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="relative h-64 overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <div className="flex h-16 w-16 animate-[float_4s_ease-in-out_infinite] items-center justify-center rounded-full bg-blue-600 font-semibold text-white dark:bg-blue-500">
                  ML
                </div>
              </div>

              <div className="absolute top-8 left-16">
                <div className="flex h-12 w-12 animate-[pulse-subtle_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white [animation-delay:0.5s]">
                  Stats
                </div>
              </div>
              <div className="absolute top-8 right-16">
                <div className="flex h-12 w-12 animate-[pulse-subtle_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-purple-500 text-sm font-medium text-white [animation-delay:1s]">
                  Math
                </div>
              </div>
              <div className="absolute bottom-8 left-20">
                <div className="flex h-12 w-12 animate-[pulse-subtle_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-orange-500 text-sm font-medium text-white [animation-delay:1.5s]">
                  Data
                </div>
              </div>
              <div className="absolute right-20 bottom-8">
                <div className="flex h-12 w-12 animate-[pulse-subtle_2s_ease-in-out_infinite] items-center justify-center rounded-full bg-red-500 text-sm font-medium text-white [animation-delay:2s]">
                  Code
                </div>
              </div>

              <svg className="absolute inset-0 -z-10 h-full w-full">
                <line
                  x1="50%"
                  y1="50%"
                  x2="20%"
                  y2="20%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                  className="dark:stroke-gray-600"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="80%"
                  y2="20%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                  className="dark:stroke-gray-600"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="25%"
                  y2="80%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                  className="dark:stroke-gray-600"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="75%"
                  y2="80%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                  className="dark:stroke-gray-600"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      <MyActiveCourses />

      <Footer />
    </div>
  );
}
