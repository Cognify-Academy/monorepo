"use client";

import { BookOpenIcon } from "@/icons/book-open-icon";
import { CalendarIcon } from "@/icons/calendar-icon";
import { CheckmarkIcon } from "@/icons/checkmark-icon";
import { useEffect, useState } from "react";

interface Concept {
  id: string;
  name: string;
  slug: string;
  description: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
  completedLessons: Array<{
    lessonId: string;
    lessonTitle: string;
    completedAt?: string | null;
  }>;
}

interface ViewConceptDialogProps {
  concept: Concept | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewConceptDialog({
  concept,
  isOpen,
  onClose,
}: ViewConceptDialogProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      return;
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!concept || !isVisible) return null;

  const getImportanceColor = (importance: number) => {
    if (importance >= 8)
      return "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20";
    if (importance >= 6)
      return "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/20";
    if (importance >= 4)
      return "text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20";
    return "text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl transform rounded-lg bg-white p-6 shadow-xl transition-all dark:bg-gray-800">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <BookOpenIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {concept.name}
              </h2>
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getImportanceColor(
                  concept.importance,
                )}`}
              >
                Importance: {concept.importance}/10
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </h3>
            <p className="leading-relaxed text-gray-600 dark:text-gray-300">
              {concept.description}
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
              <CheckmarkIcon className="mr-2 h-4 w-4" />
              <span>
                {concept.completedLessons.length} lesson
                {concept.completedLessons.length !== 1 ? "s" : ""} completed
              </span>
            </div>

            {concept.completedLessons.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Learned from:
                </h4>
                <div className="max-h-48 space-y-2 overflow-y-auto">
                  {concept.completedLessons.map((lesson) => (
                    <div
                      key={lesson.lessonId}
                      className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700"
                    >
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {lesson.lessonTitle}
                      </span>
                      {lesson.completedAt && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <CalendarIcon className="h-3 w-3" />
                          <span>{formatDate(lesson.completedAt)}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 dark:border-gray-600">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
