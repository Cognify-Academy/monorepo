"use client";

import { useAuth } from "@/contexts/auth";
import Link from "next/link";

export default function ReadyToLearn() {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't render if user is authenticated or still loading
  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-16 text-center">
      <div className="rounded-lg border border-gray-100 bg-white p-8 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Ready to Start Learning?
        </h2>
        <p className="mb-6 text-gray-600">
          Join thousands of learners building deeper understanding through
          connected knowledge.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-lg bg-blue-600 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Sign Up Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-gray-300 px-8 py-3 text-lg font-semibold text-gray-900 transition-colors hover:bg-gray-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
