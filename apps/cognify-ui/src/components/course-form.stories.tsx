import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import type { ConceptType } from "./concept-selector";
import { CourseForm } from "./course-form";

// Mock concepts data
const mockConcepts: ConceptType[] = [
  { id: "1", name: "React Hooks", slug: "react-hooks" },
  { id: "2", name: "TypeScript", slug: "typescript" },
  { id: "3", name: "State Management", slug: "state-management" },
  { id: "4", name: "Component Design", slug: "component-design" },
  { id: "5", name: "API Integration", slug: "api-integration" },
  { id: "6", name: "Testing", slug: "testing" },
  { id: "7", name: "Performance", slug: "performance" },
  { id: "8", name: "Accessibility", slug: "accessibility" },
  { id: "9", name: "CSS Styling", slug: "css-styling" },
  { id: "10", name: "Form Handling", slug: "form-handling" },
];

const meta: Meta<typeof CourseForm> = {
  title: "Components/CourseForm",
  component: CourseForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive form component for creating and editing courses. Includes course basic information, concept selection, and publication status control.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    availableConcepts: {
      description: "Array of available concepts to choose from",
      control: { type: "object" },
    },
    initialData: {
      description: "Initial form data for editing",
      control: { type: "object" },
    },
    onSubmit: {
      description: "Callback function called when form is submitted",
      action: "submitted",
    },
    isLoading: {
      description: "Whether the form is in loading state",
      control: { type: "boolean" },
    },
    isEditing: {
      description: "Whether the form is in editing mode",
      control: { type: "boolean" },
    },
    error: {
      description: "Error message to display",
      control: { type: "text" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CourseForm>;

// Default create course story
export const CreateCourse: Story = {
  args: {
    availableConcepts: mockConcepts,
    onSubmit: async (data) => {
      action("course-created")(data);
    },
    isLoading: false,
    isEditing: false,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story: "The default course creation form with all fields empty.",
      },
    },
  },
};

// Edit course story with initial data
export const EditCourse: Story = {
  args: {
    availableConcepts: mockConcepts,
    initialData: {
      title: "Introduction to React",
      description:
        "Learn the fundamentals of React including components, hooks, and state management. This comprehensive course covers everything you need to know to build modern web applications with React.",
      conceptIds: ["1", "2", "3"],
      published: true,
    },
    onSubmit: async (data) => {
      action("course-updated")(data);
    },
    isLoading: false,
    isEditing: true,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story: "Course form in editing mode with pre-populated data.",
      },
    },
  },
};

// Loading state
export const Loading: Story = {
  args: {
    availableConcepts: mockConcepts,
    initialData: {
      title: "Introduction to React",
      description:
        "Learn the fundamentals of React including components, hooks, and state management.",
      conceptIds: ["1", "2"],
      published: false,
    },
    onSubmit: async (data) => {
      action("course-submitted")(data);
    },
    isLoading: true,
    isEditing: false,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story: "Form in loading state while submitting data.",
      },
    },
  },
};

// Error state
export const WithError: Story = {
  args: {
    availableConcepts: mockConcepts,
    initialData: {
      title: "Failed Course",
      description: "This course failed to save.",
      conceptIds: ["1"],
      published: false,
    },
    onSubmit: async (data) => {
      action("course-submitted")(data);
    },
    isLoading: false,
    isEditing: false,
    error:
      "Failed to create course. Please check your network connection and try again.",
  },
  parameters: {
    docs: {
      description: {
        story: "Form displaying an error message.",
      },
    },
  },
};

// Published course
export const PublishedCourse: Story = {
  args: {
    availableConcepts: mockConcepts,
    initialData: {
      title: "Advanced JavaScript",
      description:
        "Master modern JavaScript with advanced concepts like closures, async/await, and design patterns.",
      conceptIds: ["1", "3", "5"],
      published: true,
    },
    onSubmit: async (data) => {
      action("course-updated")(data);
    },
    isLoading: false,
    isEditing: true,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story: "Course form with published status enabled.",
      },
    },
  },
};

// Empty concepts array
export const NoConcepts: Story = {
  args: {
    availableConcepts: [],
    onSubmit: async (data) => {
      action("course-created")(data);
    },
    isLoading: false,
    isEditing: false,
    error: null,
  },
  parameters: {
    docs: {
      description: {
        story: "Form with no available concepts to select from.",
      },
    },
  },
};
