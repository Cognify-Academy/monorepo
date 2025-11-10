"use client";

import { useAuth } from "@/contexts/auth";
import { useLessonProgress, useRecordLessonProgress } from "@/lib/api-hooks";

interface LessonCompletionProps {
  lessonId: string;
  initialCompleted?: boolean;
}

export function LessonCompletion({
  lessonId,
  initialCompleted = false,
}: LessonCompletionProps) {
  const { isAuthenticated } = useAuth();

  // Use React Query hooks for lesson progress
  const { data: progressData, isLoading: isInitialLoading } = useLessonProgress(
    lessonId,
    isAuthenticated,
  );

  const recordProgress = useRecordLessonProgress();

  // Determine completion status from API or initial prop
  const isCompleted = progressData?.progress?.completed ?? initialCompleted;

  const isLoading = recordProgress.isPending;
  const error = recordProgress.error
    ? (recordProgress.error as Error).message ||
      "Failed to update lesson progress. Please try again."
    : null;

  const handleMarkAsComplete = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await recordProgress.mutateAsync({
        lessonId,
        completed: true,
      });
    } catch (err) {
      // Error is handled by React Query
      console.error("Error marking lesson as complete:", err);
    }
  };

  const handleMarkAsIncomplete = async () => {
    if (!isAuthenticated) {
      return;
    }

    try {
      await recordProgress.mutateAsync({
        lessonId,
        completed: false,
      });
    } catch (err) {
      console.error("Error updating lesson progress:", err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Please log in to track your lesson progress.
        </p>
      </div>
    );
  }

  if (isInitialLoading) {
    return (
      <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-300 dark:bg-gray-600" />
          <div className="flex-1">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
            <div className="mt-1 h-3 w-48 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            {isCompleted ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="h-4 w-4 text-green-600 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="h-6 w-6 rounded-full border-2 border-gray-300 dark:border-gray-600" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {isCompleted ? "Lesson completed" : "Mark as complete"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isCompleted
                ? "Great job! You've completed this lesson."
                : "Click to mark this lesson as complete"}
            </p>
          </div>
        </div>

        <button
          onClick={isCompleted ? handleMarkAsIncomplete : handleMarkAsComplete}
          disabled={isLoading}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            isCompleted
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              : "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <svg
                className="h-4 w-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>Updating...</span>
            </div>
          ) : isCompleted ? (
            "Mark as incomplete"
          ) : (
            "Mark as complete"
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
