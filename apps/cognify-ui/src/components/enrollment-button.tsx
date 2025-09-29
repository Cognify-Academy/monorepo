"use client";

import { Button } from "@/components/button";
import { useAuth } from "@/contexts/auth";
import { checkEnrollmentStatus, enrollInCourse } from "@/services/courses";
import Link from "next/link";
import { useEffect, useState } from "react";

interface EnrollmentButtonProps {
  courseIdentifier: string;
  courseName: string;
  courseId: string;
  firstLessonId?: string;
}

export function EnrollmentButton({
  courseIdentifier,
  courseName,
  courseId,
}: EnrollmentButtonProps) {
  const { isAuthenticated, accessToken } = useAuth();
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState<
    "idle" | "enrolled" | "failed"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const checkEnrollment = async () => {
      if (isAuthenticated && accessToken) {
        try {
          const enrolled = await checkEnrollmentStatus(courseId, accessToken);
          setIsEnrolled(enrolled);
        } catch (error) {
          console.error("Failed to check enrollment status:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkEnrollment();
  }, [isAuthenticated, accessToken, courseId]);

  const handleEnroll = async () => {
    setIsEnrolling(true);
    setErrorMessage("");

    try {
      if (!isAuthenticated || !accessToken) {
        setEnrollmentStatus("failed");
        setErrorMessage("You must be logged in to enroll.");
        return;
      }

      const result = await enrollInCourse(courseIdentifier, accessToken);
      if (result.success) {
        setEnrollmentStatus("enrolled");
        setIsEnrolled(true);
      } else {
        setEnrollmentStatus("failed");
        setErrorMessage(result.message);
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      setEnrollmentStatus("failed");
      setErrorMessage("Failed to enroll in course. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">
          You need to be logged in to enroll in this course.
        </p>
        <div className="flex space-x-3">
          <Link href="/login">
            <Button>Log in</Button>
          </Link>
          <Link href="/signup">
            <Button className="border border-gray-300 text-gray-900 hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-800">
              Sign up
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            Checking enrollment status...
          </span>
        </div>
      </div>
    );
  }

  if (isEnrolled || enrollmentStatus === "enrolled") {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              You are enrolled in {courseName}
            </p>
          </div>
          <Link href="/courses/enrolled">
            <Button className="bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600">
              Continue Learning
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900 dark:text-white">
            Enroll in {courseName}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Get access to all lessons and track your progress.
          </p>
        </div>
        <Button onClick={handleEnroll} disabled={isEnrolling} className="ml-4">
          {isEnrolling ? "Enrolling..." : "Enroll Now"}
        </Button>
      </div>

      {enrollmentStatus === "failed" && errorMessage && (
        <div className="mt-3 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-200">
            {errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}
