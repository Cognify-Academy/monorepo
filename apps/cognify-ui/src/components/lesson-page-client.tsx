"use client";

import { LessonCompletion } from "./lesson-completion";

interface LessonPageClientProps {
  lessonId: string;
  children: React.ReactNode;
}

export function LessonPageClient({
  lessonId,
  children,
}: LessonPageClientProps) {
  return (
    <>
      {children}
      <LessonCompletion lessonId={lessonId} />
    </>
  );
}
