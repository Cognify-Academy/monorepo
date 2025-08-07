import Footer from "@/components/footer";
import { Navbar } from "@/components/navbar";
import Link from "next/link";

export default function KnowledgeGraphsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="mb-6 text-5xl leading-tight font-extrabold text-gray-900 md:text-6xl">
          What Are <span className="text-blue-600">Knowledge Graphs</span>?
        </h1>
        <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-gray-700">
          Discover how interconnected data helps you learn deeper, faster, and
          more intuitively at Cognify Academy.
        </p>
      </section>

      {/* Connecting the Dots Section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-4xl font-bold text-gray-900">
              Connecting the Dots of Knowledge
            </h2>
            <p className="mb-4 text-lg text-gray-700">
              Imagine a vast network where every piece of information isn't just
              stored, but connected to other related pieces. That's a Knowledge
              Graph. It's a structured way to represent knowledge, using
              entities (like "Machine Learning" or "Python") and the
              relationships between them (like "Machine Learning uses Python").
            </p>
            <p className="text-lg text-gray-700">
              Unlike traditional databases, which are often rigid, knowledge
              graphs are flexible and can grow dynamically. They help systems
              (and learners!) understand the context and meaning behind data,
              rather than just knowing isolated facts.
            </p>
          </div>
          <div className="relative flex h-80 items-center justify-center">
            <div
              className="absolute z-10 flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white shadow-lg"
              style={{ animation: "float 4s ease-in-out infinite" }}
            >
              Concept A
            </div>

            <div
              className="absolute top-10 left-10 z-0 flex h-20 w-20 items-center justify-center rounded-full bg-green-500 text-sm text-white shadow"
              style={{
                animation: "pulse-subtle 2s ease-in-out infinite",
                animationDelay: "0.5s",
              }}
            >
              Related B
            </div>
            <div
              className="absolute top-20 right-10 z-0 flex h-20 w-20 items-center justify-center rounded-full bg-purple-500 text-sm text-white shadow"
              style={{
                animation: "pulse-subtle 2s ease-in-out infinite",
                animationDelay: "1s",
              }}
            >
              Related C
            </div>
            <div
              className="absolute bottom-10 left-20 z-0 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-500 text-sm text-white shadow"
              style={{
                animation: "pulse-subtle 2s ease-in-out infinite",
                animationDelay: "1.5s",
              }}
            >
              Related D
            </div>
            <div
              className="absolute right-20 bottom-20 z-0 flex h-20 w-20 items-center justify-center rounded-full bg-red-500 text-sm text-white shadow"
              style={{
                animation: "pulse-subtle 2s ease-in-out infinite",
                animationDelay: "2s",
              }}
            >
              Related E
            </div>

            <svg
              className="absolute inset-0 h-full w-full"
              style={{ zIndex: -1 }}
            >
              <line
                x1="50%"
                y1="50%"
                x2="25%"
                y2="25%"
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.7"
              />
              <line
                x1="50%"
                y1="50%"
                x2="75%"
                y2="30%"
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.7"
              />
              <line
                x1="50%"
                y1="50%"
                x2="35%"
                y2="75%"
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.7"
              />
              <line
                x1="50%"
                y1="50%"
                x2="65%"
                y2="80%"
                stroke="#cbd5e1"
                strokeWidth="2"
                opacity="0.7"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* How We Use Knowledge Graphs Section */}
      <section className="mx-auto my-10 max-w-7xl rounded-lg bg-gray-100 px-4 py-16 shadow-inner sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold text-gray-900">
            How We Use Knowledge Graphs at Cognify Academy
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-700">
            We integrate knowledge graph technology directly into your learning
            experience to provide unparalleled clarity and depth.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Personalized Learning Paths
            </h3>
            <p className="text-sm text-gray-600">
              Our knowledge graph understands your current knowledge state and
              recommends the most relevant next steps, filling gaps and building
              on strengths.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Contextualized Explanations
            </h3>
            <p className="text-sm text-gray-600">
              When you encounter a new concept, the platform shows you its
              prerequisites, related ideas, and real-world applications,
              providing immediate context.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
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
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Intelligent Search & Discovery
            </h3>
            <p className="text-sm text-gray-600">
              Our search goes beyond keywords, understanding your intent and
              providing courses, lessons, and resources truly relevant to your
              query.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Concept Mapping Tools
            </h3>
            <p className="text-sm text-gray-600">
              Instructors can easily define and link concepts within their
              courses, ensuring a coherent and interconnected curriculum for
              learners.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Dynamic Content Updates
            </h3>
            <p className="text-sm text-gray-600">
              As new information emerges or courses are updated, the knowledge
              graph intelligently propagates changes, keeping your learning
              current.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <svg
                className="h-6 w-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V3a1 1 0 00-1-1H6a1 1 0 00-1 1v12a1 1 0 001 1h5l1 1v2m-1-2h2a1 1 0 001-1v-2l1-1h5a1 1 0 001 1v2a1 1 0 001 1h2a1 1 0 001-1v-12a1 1 0 00-1-1H7a1 1 0 00-1 1v2a1 1 0 001 1h5z"
                />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Enhanced Collaboration
            </h3>
            <p className="text-sm text-gray-600">
              Instructors can see how their course content connects with others,
              facilitating collaboration and holistic curriculum development.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          Experience Smarter Learning Today
        </h2>
        <p className="mb-8 text-lg text-gray-700">
          Dive into courses powered by Knowledge Graphs and transform your
          understanding.
        </p>
        <Link
          href="/courses"
          className="inline-block rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700"
        >
          Explore Courses
        </Link>
      </section>

      <Footer />
    </div>
  );
}
