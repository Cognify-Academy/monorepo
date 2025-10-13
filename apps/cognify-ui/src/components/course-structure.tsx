"use client";

import { useAuth } from "@/contexts/auth";
import { apiClient } from "@/lib/api";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { ConceptSelector, type ConceptType } from "./concept-selector";
import { TextInput } from "./input";
import { MediaDialog } from "./media-dialog";

export interface Media {
  id: string;
  title: string;
  description: string;
  mediaType: string;
  url?: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string | null;
  order: number;
  conceptIds: string[];
  media: Media[];
  sectionId?: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  order: number;
  conceptIds: string[];
  lessons: Lesson[];
}

export interface CourseStructureProps {
  courseId: string;
  sections: Section[];
  onSectionsChange: (sections: Section[]) => void;
  availableConcepts: ConceptType[];
  disabled?: boolean;
}

interface DraggedItem {
  type: "section" | "lesson";
  id: string;
  sectionId?: string;
  index: number;
}

export function CourseStructure({
  courseId,
  sections,
  onSectionsChange,
  availableConcepts,
  disabled = false,
}: CourseStructureProps) {
  const { accessToken } = useAuth();

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(),
  );
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const draggedItemRef = useRef<DraggedItem | null>(null);

  useEffect(() => {
    draggedItemRef.current = draggedItem;
  }, [draggedItem]);
  const [dragOverSection, setDragOverSection] = useState<string | null>(null);
  const [dragOverLesson, setDragOverLesson] = useState<{
    sectionId: string;
    beforeLessonId?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingLessons, setSavingLessons] = useState<Set<string>>(new Set());

  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 3000);
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const addSection = async () => {
    if (!accessToken) {
      showError("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const newSection = await apiClient.createSection(
        courseId,
        {
          title: "",
          description: "",
          conceptIds: [],
        },
        accessToken,
      );

      console.log("New section created:", newSection);

      const sectionWithLessons: Section = {
        ...newSection,
        lessons: [],
      };

      console.log("Section with lessons:", sectionWithLessons);

      onSectionsChange([...sections, sectionWithLessons]);
      setExpandedSections(new Set([...expandedSections, newSection.id]));
    } catch (error: unknown) {
      console.error("Failed to create section:", error);
      showError("Failed to create section");
    } finally {
      setIsLoading(false);
    }
  };

  const updateSection = async (
    sectionId: string,
    updates: Partial<Section>,
  ) => {
    if (!accessToken) {
      showError("Authentication required");
      return;
    }

    const section = sections.find((s) => s.id === sectionId);
    if (!section) {
      console.error(
        "Section not found:",
        sectionId,
        "Available sections:",
        sections.map((s) => s.id),
      );
      return;
    }

    const updatedSections = sections.map((s) =>
      s.id === sectionId ? { ...s, ...updates } : s,
    );
    onSectionsChange(updatedSections);

    const updatedSection = updatedSections.find((s) => s.id === sectionId);
    if (!updatedSection) return;

    try {
      await apiClient.updateSection(
        courseId,
        sectionId,
        {
          title: updatedSection.title,
          description: updatedSection.description,
          conceptIds: updatedSection.conceptIds || [],
        },
        accessToken,
      );
    } catch (error: unknown) {
      console.error("Failed to update section:", error);
      showError("Failed to update section");

      onSectionsChange(sections);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (!accessToken) {
      showError("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.deleteSection(courseId, sectionId, accessToken);
      const updatedSections = sections.filter((s) => s.id !== sectionId);
      onSectionsChange(updatedSections);
      const newExpanded = new Set(expandedSections);
      newExpanded.delete(sectionId);
      setExpandedSections(newExpanded);
    } catch (error: unknown) {
      console.error("Failed to delete section:", error);
      showError("Failed to delete section");
    } finally {
      setIsLoading(false);
    }
  };

  const addLesson = async (sectionId: string) => {
    if (!accessToken) {
      showError("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      const newLessonData = await apiClient.createLesson(
        courseId,
        sectionId,
        {
          title: "",
          description: "",
          content: null,
          conceptIds: [],
        },
        accessToken,
      );

      const newLesson: Lesson = {
        ...newLessonData,
        media: [],
      };

      const updatedSections = sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: [...section.lessons, newLesson],
          };
        }
        return section;
      });
      onSectionsChange(updatedSections);
    } catch (error: unknown) {
      console.error("Failed to create lesson:", error);
      showError("Failed to create lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLesson = (
    sectionId: string,
    lessonId: string,
    updates: Partial<Lesson>,
  ) => {
    const updatedSections = sections.map((s) => {
      if (s.id === sectionId) {
        return {
          ...s,
          lessons: s.lessons.map((l) =>
            l.id === lessonId ? { ...l, ...updates } : l,
          ),
        };
      }
      return s;
    });
    onSectionsChange(updatedSections);
  };

  const saveLesson = async (sectionId: string, lessonId: string) => {
    if (!accessToken) {
      showError("Authentication required");
      return;
    }

    const section = sections.find((s) => s.id === sectionId);
    const lesson = section?.lessons.find((l) => l.id === lessonId);
    if (!section || !lesson) {
      showError("Lesson not found");
      return;
    }

    setSavingLessons((prev) => new Set([...prev, lessonId]));

    try {
      await apiClient.updateLesson(
        courseId,
        sectionId,
        lessonId,
        {
          title: lesson.title,
          description: lesson.description,
          content: lesson.content,
          conceptIds: lesson.conceptIds || [],
        },
        accessToken,
      );
    } catch {
      showError("Failed to save lesson");
    } finally {
      setSavingLessons((prev) => {
        const next = new Set(prev);
        next.delete(lessonId);
        return next;
      });
    }
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!accessToken) {
      showError("Authentication required");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.deleteLesson(courseId, sectionId, lessonId, accessToken);
      const updatedSections = sections.map((section) => {
        if (section.id === sectionId) {
          return {
            ...section,
            lessons: section.lessons.filter((lesson) => lesson.id !== lessonId),
          };
        }
        return section;
      });
      onSectionsChange(updatedSections);
    } catch {
      showError("Failed to delete lesson");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionDragStart = (e: React.DragEvent, sectionId: string) => {
    const sectionIndex = sections.findIndex((s) => s.id === sectionId);
    setDraggedItem({ type: "section", id: sectionId, index: sectionIndex });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "section");
  };

  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    if (draggedItem?.type === "section" && draggedItem.id !== sectionId) {
      setDragOverSection(sectionId);
    } else if (draggedItem?.type === "lesson") {
      setDragOverSection(sectionId);
    }
  };

  const handleSectionDrop = async (
    e: React.DragEvent,
    targetSectionId: string,
  ) => {
    e.preventDefault();
    setDragOverSection(null);

    if (!draggedItem || !accessToken) return;

    if (draggedItem.type === "section") {
      const draggedIndex = draggedItem.index;
      const targetIndex = sections.findIndex((s) => s.id === targetSectionId);

      if (draggedIndex === targetIndex) return;

      const newSections = [...sections];
      const [removed] = newSections.splice(draggedIndex, 1);
      newSections.splice(targetIndex, 0, removed);

      const updatedSections = newSections.map((section, idx) => ({
        ...section,
        order: idx,
      }));

      onSectionsChange(updatedSections);

      try {
        const sectionsToReorder = updatedSections.filter((section) => {
          return (
            section.id &&
            !section.id.startsWith("section-") &&
            section.id.length > 10
          );
        });

        if (sectionsToReorder.length > 0) {
          await apiClient.reorderSections(
            courseId,
            sectionsToReorder.map((s) => ({ id: s.id, order: s.order })),
            accessToken,
          );
          console.log("Section reorder API call successful");
        }
      } catch (error: unknown) {
        console.error("Section reorder error:", error);
        showError("Failed to reorder sections");
        onSectionsChange(sections);
      }
    } else if (draggedItem.type === "lesson") {
      if (draggedItem.sectionId && draggedItem.sectionId !== targetSectionId) {
        await moveLessonToSection(
          draggedItem.id,
          draggedItem.sectionId!,
          targetSectionId,
        );
      }
    }

    setDraggedItem(null);
  };

  const handleLessonDragStart = (
    e: React.DragEvent,
    lessonId: string,
    sectionId: string,
  ) => {
    e.stopPropagation();
    setDraggedItem({
      type: "lesson",
      id: lessonId,
      sectionId,
      index: 0,
    });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "lesson");
  };

  const handleLessonDragEnd = () => {
    setDraggedItem(null);
    setDragOverLesson(null);
  };

  const handleLessonsContainerDragLeave = () => {
    setDragOverLesson(null);
  };

  const handleLessonsContainerDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    if (!draggedItem || draggedItem.type !== "lesson") return;

    const target = e.target as HTMLElement;
    const lessonElement = target.closest("[data-lesson-id]") as HTMLElement;

    if (lessonElement) {
      const lessonId = lessonElement.dataset.lessonId;
      const sectionId = lessonElement.dataset.sectionId;
      if (lessonId && sectionId) {
        setDragOverLesson({
          sectionId,
          beforeLessonId: lessonId,
        });
      }
    } else {
      setDragOverLesson(null);
    }
  };

  const handleLessonsContainerDrop = async (
    e: React.DragEvent,
    sectionId: string,
  ) => {
    e.preventDefault();
    setDragOverLesson(null);

    const currentDraggedItem = draggedItemRef.current;
    if (
      !currentDraggedItem ||
      currentDraggedItem.type !== "lesson" ||
      !accessToken ||
      !currentDraggedItem.sectionId
    ) {
      return;
    }

    const draggedLessonId = currentDraggedItem.id;
    const sourceSectionId = currentDraggedItem.sectionId;

    const target = e.target as HTMLElement;
    const lessonElement = target.closest("[data-lesson-id]") as HTMLElement;

    if (lessonElement && sourceSectionId === sectionId) {
      const targetLessonId = lessonElement.getAttribute("data-lesson-id") || "";
      const rect = lessonElement.getBoundingClientRect();
      const offset = rect.y + rect.height / 2;
      const beforeLessonId = e.clientY < offset ? targetLessonId : undefined;
      await reorderLessonsInSection(sectionId, draggedLessonId, beforeLessonId);
    } else if (sourceSectionId !== sectionId) {
      await moveLessonToSection(draggedLessonId, sourceSectionId, sectionId);
    } else if (!lessonElement) {
      await reorderLessonsInSection(sectionId, draggedLessonId, undefined);
    }

    setDraggedItem(null);
  };

  const reorderLessonsInSection = async (
    sectionId: string,
    draggedLessonId: string,
    beforeLessonId?: string,
  ) => {
    if (!accessToken) return;

    try {
      const section = sections.find((s) => s.id === sectionId);
      if (!section) return;

      const draggedLesson = section.lessons.find(
        (l) => l.id === draggedLessonId,
      );
      if (!draggedLesson) return;

      // Create new lesson order
      const newLessons = [...section.lessons];
      const draggedIndex = newLessons.findIndex(
        (l) => l.id === draggedLessonId,
      );
      newLessons.splice(draggedIndex, 1);

      if (beforeLessonId) {
        const beforeIndex = newLessons.findIndex(
          (l) => l.id === beforeLessonId,
        );
        newLessons.splice(beforeIndex, 0, draggedLesson);
      } else {
        newLessons.push(draggedLesson);
      }

      // Update order property for each lesson
      const reorderedLessons = newLessons.map((lesson, index) => ({
        ...lesson,
        order: index,
      }));

      // Update UI immediately
      const updatedSection = { ...section, lessons: reorderedLessons };
      const updatedSections = sections.map((s) =>
        s.id === sectionId ? updatedSection : s,
      );
      onSectionsChange(updatedSections);

      // Save to server
      const orderingData = reorderedLessons.map((lesson, index) => ({
        id: lesson.id,
        sectionId,
        order: index,
      }));

      await apiClient.reorderLessons(courseId, orderingData, accessToken);
    } catch (error: unknown) {
      showError("Failed to reorder lessons");
      onSectionsChange(sections);
    }
  };

  const moveLessonToSection = async (
    lessonId: string,
    sourceSectionId: string,
    targetSectionId: string,
    beforeLessonId?: string,
  ) => {
    if (!accessToken) return;

    try {
      const sourceSection = sections.find((s) => s.id === sourceSectionId);
      const targetSection = sections.find((s) => s.id === targetSectionId);
      if (!sourceSection || !targetSection) return;

      const lesson = sourceSection.lessons.find((l) => l.id === lessonId);
      if (!lesson) return;

      // Remove from source section
      const newSourceLessons = sourceSection.lessons.filter(
        (l) => l.id !== lessonId,
      );

      // Add to target section
      const newTargetLessons = [...targetSection.lessons];
      if (beforeLessonId) {
        const beforeIndex = newTargetLessons.findIndex(
          (l) => l.id === beforeLessonId,
        );
        newTargetLessons.splice(beforeIndex, 0, lesson);
      } else {
        newTargetLessons.push(lesson);
      }

      // Update order properties
      const reorderedSourceLessons = newSourceLessons.map((lesson, index) => ({
        ...lesson,
        order: index,
      }));

      const reorderedTargetLessons = newTargetLessons.map((lesson, index) => ({
        ...lesson,
        order: index,
      }));

      // Update UI immediately
      const updatedSections = sections.map((s) => {
        if (s.id === sourceSectionId) {
          return { ...s, lessons: reorderedSourceLessons };
        }
        if (s.id === targetSectionId) {
          return { ...s, lessons: reorderedTargetLessons };
        }
        return s;
      });

      onSectionsChange(updatedSections);

      // Save to server
      const orderingData = reorderedTargetLessons.map((lesson, index) => ({
        id: lesson.id,
        sectionId: targetSectionId,
        order: index,
      }));

      await apiClient.reorderLessons(courseId, orderingData, accessToken);
    } catch (error: unknown) {
      showError("Failed to move lesson");
      onSectionsChange(sections);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Course Structure / Lessons
        </label>
        <Button
          type="button"
          onClick={addSection}
          disabled={disabled || isLoading}
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800"
        >
          <svg
            className="mr-2 h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Section
        </Button>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <SectionEditor
            key={section.id}
            courseId={courseId}
            section={section}
            availableConcepts={availableConcepts}
            isExpanded={expandedSections.has(section.id)}
            onToggle={() => toggleSection(section.id)}
            onUpdate={(updates) => updateSection(section.id, updates)}
            onDelete={() => deleteSection(section.id)}
            onAddLesson={() => addLesson(section.id)}
            onUpdateLesson={(lessonId, updates) =>
              updateLesson(section.id, lessonId, updates)
            }
            onSaveLesson={(lessonId) => saveLesson(section.id, lessonId)}
            onDeleteLesson={(lessonId) => deleteLesson(section.id, lessonId)}
            disabled={disabled || isLoading}
            savingLessonsSet={savingLessons}
            onDragStart={(e) => handleSectionDragStart(e, section.id)}
            onDragOver={(e) => handleSectionDragOver(e, section.id)}
            onDrop={(e) => handleSectionDrop(e, section.id)}
            onLessonDragStart={(e, lessonId) =>
              handleLessonDragStart(e, lessonId, section.id)
            }
            onLessonDragEnd={handleLessonDragEnd}
            onLessonsContainerDragOver={(e) =>
              handleLessonsContainerDragOver(e)
            }
            onLessonsContainerDragLeave={handleLessonsContainerDragLeave}
            onLessonsContainerDrop={(e) =>
              handleLessonsContainerDrop(e, section.id)
            }
            isDraggedOver={
              dragOverSection === section.id ||
              dragOverLesson?.sectionId === section.id
            }
            draggedItem={draggedItem}
            dragOverLesson={dragOverLesson}
          />
        ))}

        {sections.length === 0 && (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            <p>
              No sections added yet. Click &quot;Add Section&quot; to get
              started.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

interface SectionEditorProps {
  courseId: string;
  section: Section;
  availableConcepts: ConceptType[];
  isExpanded: boolean;
  onToggle: () => void;
  onUpdate: (updates: Partial<Section>) => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onUpdateLesson: (lessonId: string, updates: Partial<Lesson>) => void;
  onSaveLesson: (lessonId: string) => void;
  onDeleteLesson: (lessonId: string) => void;
  disabled?: boolean;
  savingLessonsSet?: Set<string>;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onLessonDragStart: (e: React.DragEvent, lessonId: string) => void;
  onLessonDragEnd: () => void;
  onLessonsContainerDragOver: (e: React.DragEvent) => void;
  onLessonsContainerDragLeave: () => void;
  onLessonsContainerDrop: (e: React.DragEvent) => void;
  isDraggedOver: boolean;
  draggedItem: DraggedItem | null;
  dragOverLesson: {
    sectionId: string;
    beforeLessonId?: string;
  } | null;
}

function SectionEditor({
  courseId,
  section,
  availableConcepts,
  isExpanded,
  onToggle,
  onUpdate,
  onDelete,
  onAddLesson,
  onUpdateLesson,
  onSaveLesson,
  onDeleteLesson,
  disabled = false,
  savingLessonsSet,
  onDragStart,
  onDragOver,
  onDrop,
  onLessonDragStart,
  onLessonDragEnd,
  onLessonsContainerDragOver,
  onLessonsContainerDragLeave,
  onLessonsContainerDrop,
  isDraggedOver,
  draggedItem,
  dragOverLesson,
}: SectionEditorProps) {
  return (
    <div
      className={`rounded-lg border ${
        isDraggedOver
          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
          : "border-gray-200 dark:border-gray-600"
      }`}
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onToggle}
            className="flex flex-1 items-center space-x-2 text-left"
            disabled={disabled}
          >
            <svg
              className={`h-4 w-4 text-gray-900 transition-transform dark:text-white ${
                isExpanded ? "rotate-90" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title || "Untitled Section"}
            </h3>
            <div className="ml-auto flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {section.lessons.length} lessons
              </span>
              <svg
                className="h-4 w-4 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                />
              </svg>
            </div>
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4 bg-white p-4 dark:bg-gray-800">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Section Title
            </label>
            <TextInput
              type="text"
              value={section.title}
              onChange={(e) => {
                console.log(
                  "Section title onChange:",
                  e.target.value,
                  "for section:",
                  section.id,
                );
                onUpdate({ title: e.target.value });
              }}
              placeholder="Enter section title"
              disabled={disabled}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Section Description
            </label>
            <textarea
              value={section.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Enter section description"
              rows={2}
              disabled={disabled}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-3 text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Section Concepts
            </label>
            <ConceptSelector
              availableConcepts={availableConcepts}
              selectedConceptIds={section.conceptIds}
              onChange={(conceptIds) => onUpdate({ conceptIds })}
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Lessons
              </label>
              <Button
                type="button"
                onClick={onAddLesson}
                disabled={disabled}
                className="inline-flex items-center rounded border border-transparent bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
              >
                <svg
                  className="mr-1 h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Lesson
              </Button>
            </div>

            <div
              className={`min-h-[50px] space-y-2 rounded border p-2 transition-all duration-200 ${
                isDraggedOver
                  ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
                  : "border-gray-200 bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
              }`}
              onDragOver={(e) => onLessonsContainerDragOver(e)}
              onDragLeave={() => onLessonsContainerDragLeave()}
              onDrop={(e) => onLessonsContainerDrop(e)}
            >
              {section.lessons
                .sort((a, b) => a.order - b.order)
                .map((lesson) => (
                  <div key={lesson.id} data-lesson-id={lesson.id}>
                    <LessonEditor
                      lesson={lesson}
                      availableConcepts={availableConcepts}
                      onUpdate={(updates) => onUpdateLesson(lesson.id, updates)}
                      onSave={() => onSaveLesson(lesson.id)}
                      onDelete={() => onDeleteLesson(lesson.id)}
                      disabled={disabled}
                      isSaving={savingLessonsSet?.has(lesson.id) || false}
                      onDragStart={(e) => onLessonDragStart(e, lesson.id)}
                      onDragEnd={onLessonDragEnd}
                      isDragged={
                        draggedItem?.type === "lesson" &&
                        draggedItem.id === lesson.id
                      }
                      isDragOver={
                        dragOverLesson?.sectionId === section.id &&
                        dragOverLesson?.beforeLessonId === lesson.id
                      }
                      sectionId={section.id}
                    />
                  </div>
                ))}

              {section.lessons.length === 0 && (
                <p className="py-4 text-center text-gray-500 dark:text-gray-400">
                  No lessons added yet. Click &quot;Add Lesson&quot; to get
                  started.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface LessonEditorProps {
  lesson: Lesson;
  availableConcepts: ConceptType[];
  onUpdate: (updates: Partial<Lesson>) => void;
  onSave: () => void;
  onDelete: () => void;
  disabled?: boolean;
  isSaving?: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  isDragged?: boolean;
  isDragOver?: boolean;
  sectionId: string;
}

function LessonEditor({
  lesson,
  availableConcepts,
  onUpdate,
  onSave,
  onDelete,
  disabled = false,
  isSaving = false,
  onDragStart,
  onDragEnd,
  isDragged = false,
  isDragOver = false,
  sectionId,
}: LessonEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMediaDialogOpen, setIsMediaDialogOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const { accessToken } = useAuth();

  const handleAddMedia = async (newMedia: Omit<Media, "id">) => {
    if (!accessToken) return;
    try {
      const createdMedia = await apiClient.createMedia(
        {
          title: newMedia.title,
          description: newMedia.description,
          mediaType: newMedia.mediaType,
          lessonId: lesson.id,
          url: newMedia.url || "",
        },
        accessToken,
      );
      onUpdate({ media: [...(lesson.media || []), createdMedia] });
    } catch (error) {
      console.error("Failed to create media:", error);
    }
  };

  const handleUpdateMedia = async (updatedMedia: Omit<Media, "id">) => {
    if (!accessToken || !editingMedia) return;
    try {
      const returnedMedia = await apiClient.updateMedia(
        {
          title: updatedMedia.title,
          lessonId: lesson.id,
          mediaId: editingMedia.id,
          description: updatedMedia.description,
          mediaType: updatedMedia.mediaType,
          url: updatedMedia.url || "",
        },
        accessToken,
      );
      const newMediaList = (lesson.media || []).map((item) =>
        item.id === editingMedia.id ? returnedMedia : item,
      );
      onUpdate({ media: newMediaList });
    } catch (error) {
      console.error("Failed to update media:", error);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!accessToken) return;
    try {
      await apiClient.deleteMedia(mediaId, accessToken);
      const newMediaList = (lesson.media || []).filter(
        (item) => item.id !== mediaId,
      );
      onUpdate({ media: newMediaList });
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  };

  const openMediaDialog = (media: Media | null = null) => {
    setEditingMedia(media);
    setIsMediaDialogOpen(true);
  };

  return (
    <div
      className={`cursor-move rounded border transition-all duration-200 ${
        isDragged
          ? "border-blue-500 bg-blue-50 opacity-50 shadow-lg dark:border-blue-400 dark:bg-blue-900/20"
          : isDragOver
            ? "border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20"
            : "border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800"
      }`}
      draggable={!disabled}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title="Drag to reorder"
      data-lesson-id={lesson.id}
      data-section-id={sectionId}
    >
      <div className="flex items-center justify-between p-3">
        <div className="flex flex-1 items-center space-x-2">
          <div
            className="h-4 w-4 text-gray-400 dark:text-gray-500"
            title="Drag handle"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </div>
          <TextInput
            type="text"
            value={lesson.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Lesson title"
            className="flex-1"
            disabled={disabled}
            draggable={false}
            onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
          />
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              className={`h-4 w-4 text-gray-900 transition-transform dark:text-white ${
                isExpanded ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            disabled={disabled}
            className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9zM4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 112 0v4a1 1 0 11-2 0V9zm4 0a1 1 0 112 0v4a1 1 0 11-2 0V9z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-3 border-t border-gray-200 p-3 dark:border-gray-600">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lesson Description
            </label>
            <textarea
              value={lesson.description}
              onChange={(e) => onUpdate({ description: e.target.value })}
              placeholder="Lesson description"
              rows={2}
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              draggable={false}
              onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lesson Content (Markdown)
            </label>
            <textarea
              value={
                typeof lesson.content === "string"
                  ? lesson.content
                  : JSON.stringify(lesson.content, null, 2) || ""
              }
              onChange={(e) => onUpdate({ content: e.target.value })}
              placeholder="Enter lesson content as Markdown"
              rows={10}
              disabled={disabled}
              className="w-full rounded-md border border-gray-300 bg-white p-2 text-sm text-gray-900 placeholder-gray-500 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400"
              draggable={false}
              onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Lesson Concepts
            </label>
            <div
              draggable={false}
              onMouseDown={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <ConceptSelector
                availableConcepts={availableConcepts}
                selectedConceptIds={lesson.conceptIds}
                onChange={(conceptIds) => onUpdate({ conceptIds })}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Media
            </label>
            <div className="rounded-md border border-gray-300 bg-gray-50 p-2 dark:border-gray-600 dark:bg-gray-700">
              {(lesson.media || []).length > 0 ? (
                <ul className="space-y-2">
                  {(lesson.media || []).map((mediaItem) => (
                    <li
                      key={mediaItem.id}
                      className="flex items-center justify-between text-gray-900 dark:text-white"
                    >
                      <span>{mediaItem.title}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openMediaDialog(mediaItem)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMedia(mediaItem.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No media added yet.
                </p>
              )}
              <div className="mt-2">
                <Button
                  type="button"
                  onClick={() => openMediaDialog()}
                  disabled={disabled}
                  className="inline-flex items-center rounded border border-transparent bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50"
                >
                  Add Media
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={onSave}
              disabled={disabled || isSaving}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-400 dark:focus:ring-offset-gray-800 dark:disabled:bg-gray-600"
            >
              {isSaving ? (
                <>
                  <svg
                    className="mr-2 h-4 w-4 animate-spin"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Saving...
                </>
              ) : (
                <>
                  <svg
                    className="mr-2 h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                    />
                  </svg>
                  Save Lesson
                </>
              )}
            </Button>
          </div>
        </div>
      )}
      <MediaDialog
        isOpen={isMediaDialogOpen}
        onClose={() => setIsMediaDialogOpen(false)}
        onSave={editingMedia ? handleUpdateMedia : handleAddMedia}
        media={editingMedia}
      />
    </div>
  );
}
// Test comment
// Test comment for commit hook
