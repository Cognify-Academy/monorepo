"use client";

import { useState } from "react";
import { Button } from "./button";
import { ConceptSelector, type ConceptType } from "./concept-selector";
import { TextInput } from "./input";

export interface CourseFormData {
  title: string;
  description: string;
  conceptIds: string[];
  published: boolean;
}

export interface CourseFormProps {
  initialData?: Partial<CourseFormData>;
  availableConcepts: ConceptType[];
  onSubmit: (data: CourseFormData) => Promise<void>;
  isLoading?: boolean;
  isEditing?: boolean;
  error?: string | null;
}

export function CourseForm({
  initialData = {},
  availableConcepts,
  onSubmit,
  isLoading = false,
  isEditing = false,
  error,
}: CourseFormProps) {
  const [formData, setFormData] = useState<CourseFormData>({
    title: initialData.title || "",
    description: initialData.description || "",
    conceptIds: initialData.conceptIds || [],
    published: initialData.published || false,
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.title.trim()) {
      errors.title = "Course title is required";
    }

    if (!formData.description.trim()) {
      errors.description = "Course description is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  const handleChange = (
    field: keyof CourseFormData,
    value: string | boolean | string[],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  return (
    <div className="rounded-lg border border-gray-100 bg-white p-8 shadow-lg">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-900">
        {isEditing ? "Update Course" : "Create New Course"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-sm text-red-800">
            {error}
          </div>
        )}

        <CourseBasicInfo
          title={formData.title}
          description={formData.description}
          onTitleChange={(value) => handleChange("title", value)}
          onDescriptionChange={(value) => handleChange("description", value)}
          titleError={validationErrors.title}
          descriptionError={validationErrors.description}
          disabled={isLoading}
        />

        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.published}
              onChange={(e) => handleChange("published", e.target.checked)}
              disabled={isLoading}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Publish Course
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            When published, the course will be visible to students for
            enrollment.
          </p>
        </div>

        <ConceptSelector
          availableConcepts={availableConcepts}
          selectedConceptIds={formData.conceptIds}
          onChange={(conceptIds) => handleChange("conceptIds", conceptIds)}
        />

        <div className="pt-6">
          <Button
            type="submit"
            className="w-full transform rounded-lg bg-blue-600 px-6 py-3 text-lg font-semibold text-white transition-all hover:scale-105 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
            disabled={isLoading}
          >
            {isLoading
              ? isEditing
                ? "Updating Course..."
                : "Creating Course..."
              : isEditing
                ? "Update Course"
                : "Create Course"}
          </Button>
        </div>
      </form>
    </div>
  );
}

interface CourseBasicInfoProps {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  titleError?: string;
  descriptionError?: string;
  disabled?: boolean;
}

export function CourseBasicInfo({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  titleError,
  descriptionError,
  disabled = false,
}: CourseBasicInfoProps) {
  return (
    <>
      <div>
        <label
          htmlFor="course-title"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Course Title <span className="text-red-500">*</span>
        </label>
        <TextInput
          type="text"
          id="course-title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="e.g., Introduction to Machine Learning"
          disabled={disabled}
        />
        {titleError && (
          <p className="mt-1 text-sm text-red-600">{titleError}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          A clear and concise title for your course.
        </p>
      </div>

      <div>
        <label
          htmlFor="course-description"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Course Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="course-description"
          rows={4}
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 p-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Provide a comprehensive description of what students will learn in this course."
          disabled={disabled}
        />
        {descriptionError && (
          <p className="mt-1 text-sm text-red-600">{descriptionError}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          A detailed description covering topics, benefits, and target audience.
        </p>
      </div>
    </>
  );
}
