import Link from "next/link";
import { ComingSoon } from "./coming-soon";
import Footer from "./footer";
import { Navbar } from "./navbar";

export function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Navbar />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="mb-6 text-5xl leading-tight font-bold text-gray-900 md:text-6xl">
            Learn Through
            <span className="text-blue-600"> Connected Knowledge</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl leading-relaxed text-gray-600">
            Discover how concepts interconnect and build deeper understanding
            through our knowledge graph-based learning platform.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="transform rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700"
            >
              Explore Courses
            </Link>
            <button className="flex items-center rounded-lg px-8 py-4 text-lg font-semibold text-gray-600 transition-colors hover:text-gray-900">
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
              See How It Works
            </button>
          </div>
        </div>

        {/* Knowledge Graph Visualization */}
        <div className="relative mt-20">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-lg">
            <div className="relative h-64 overflow-hidden">
              {/* Central Node */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                <div className="animate-float flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  ML
                </div>
              </div>

              {/* Connected Nodes */}
              <div className="absolute top-8 left-16">
                <div className="animate-pulse-subtle flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-sm font-medium text-white">
                  Stats
                </div>
              </div>
              <div className="absolute top-8 right-16">
                <div className="animate-pulse-subtle flex h-12 w-12 items-center justify-center rounded-full bg-purple-500 text-sm font-medium text-white">
                  Math
                </div>
              </div>
              <div className="absolute bottom-8 left-20">
                <div className="animate-pulse-subtle flex h-12 w-12 items-center justify-center rounded-full bg-orange-500 text-sm font-medium text-white">
                  Data
                </div>
              </div>
              <div className="absolute right-20 bottom-8">
                <div className="animate-pulse-subtle flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-sm font-medium text-white">
                  Code
                </div>
              </div>

              {/* Connection Lines */}
              <svg className="absolute inset-0 -z-10 h-full w-full">
                <line
                  x1="50%"
                  y1="50%"
                  x2="20%"
                  y2="20%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="80%"
                  y2="20%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="25%"
                  y2="80%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <line
                  x1="50%"
                  y1="50%"
                  x2="75%"
                  y2="80%"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  opacity="0.6"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Why Knowledge Graphs?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Traditional learning is linear. Real understanding is connected.
              Our platform maps knowledge the way your brain does.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg p-6 text-center transition-colors hover:bg-gray-50">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                <svg
                  className="h-6 w-6 text-blue-600"
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
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Intuitive Connections
              </h3>
              <p className="text-gray-600">
                See how concepts relate to each other and build stronger mental
                models through visual learning paths.
              </p>
            </div>
            <div className="rounded-lg p-6 text-center transition-colors hover:bg-gray-50">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Adaptive Learning
              </h3>
              <p className="text-gray-600">
                Your learning path adjusts based on your knowledge gaps and
                interests, ensuring optimal progression.
              </p>
            </div>
            <div className="rounded-lg p-6 text-center transition-colors hover:bg-gray-50">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Deep Understanding
              </h3>
              <p className="text-gray-600">
                Move beyond memorization to true comprehension by understanding
                the &apos;why&apos; behind every concept.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ComingSoon />

      <section className="bg-blue-600 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Ready to Transform Your Learning?
          </h2>
          <p className="mb-8 text-xl text-blue-100">
            Join thousands of learners who are building deeper understanding
            through connected knowledge.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-lg bg-white px-8 py-4 text-lg font-semibold text-blue-600 transition-colors hover:bg-gray-100"
            >
              Start Learning Free
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
