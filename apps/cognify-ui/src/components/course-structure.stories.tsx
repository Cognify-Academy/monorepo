import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import type { ConceptType } from "./concept-selector";
import { CourseStructure, type Section } from "./course-structure";

// Mock concepts data
const mockConcepts: ConceptType[] = [
  { id: "1", name: "React Fundamentals", slug: "react-fundamentals" },
  { id: "2", name: "State Management", slug: "state-management" },
  { id: "3", name: "Component Architecture", slug: "component-architecture" },
  { id: "4", name: "Hooks and Effects", slug: "hooks-effects" },
  {
    id: "5",
    name: "Performance Optimization",
    slug: "performance-optimization",
  },
  { id: "6", name: "Testing", slug: "testing" },
  { id: "7", name: "TypeScript", slug: "typescript" },
  { id: "8", name: "API Integration", slug: "api-integration" },
];

// Mock sections data with conceptIds
const mockSections: Section[] = [
  {
    id: "section-1",
    title: "Getting Started",
    description: "Introduction to the course fundamentals",
    order: 0,
    conceptIds: ["1", "2"],
    lessons: [
      {
        id: "lesson-1-1",
        title: "Course Overview",
        description: "What you'll learn in this course",
        content: null,
        order: 0,
        conceptIds: ["1"],
        media: [],
      },
      {
        id: "lesson-1-2",
        title: "Setting Up Your Environment",
        description: "Installing the necessary tools and dependencies",
        content: null,
        order: 1,
        conceptIds: ["1", "7"],
        media: [],
      },
    ],
  },
  {
    id: "section-2",
    title: "Core Concepts",
    description: "Deep dive into the main topics",
    order: 1,
    conceptIds: ["2", "3", "4"],
    lessons: [
      {
        id: "lesson-2-1",
        title: "Understanding the Basics",
        description: "Fundamental concepts you need to know",
        content: null,
        order: 0,
        conceptIds: ["1"],
        media: [],
      },
      {
        id: "lesson-2-2",
        title: "Advanced Techniques",
        description: "More sophisticated approaches and patterns",
        content: null,
        order: 1,
        conceptIds: ["3", "4"],
        media: [],
      },
      {
        id: "lesson-2-3",
        title: "Best Practices",
        description: "Industry standards and recommended approaches",
        content: null,
        order: 2,
        conceptIds: ["3", "5"],
        media: [],
      },
    ],
  },
  {
    id: "section-3",
    title: "Practical Application",
    description: "Hands-on exercises and projects",
    order: 2,
    conceptIds: ["5", "6", "8"],
    lessons: [
      {
        id: "lesson-3-1",
        title: "Building Your First Project",
        description: "Step-by-step project creation",
        content: null,
        order: 0,
        conceptIds: ["8", "6"],
        media: [],
      },
    ],
  },
];

const meta: Meta<typeof CourseStructure> = {
  title: "Components/CourseStructure",
  component: CourseStructure,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A comprehensive component for managing course sections and lessons. Allows adding, editing, and organizing course content structure with drag & drop, concept selection, and API integration.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    courseId: {
      description: "ID of the course being edited",
      control: { type: "text" },
    },
    sections: {
      description: "Array of course sections with their lessons",
      control: { type: "object" },
    },
    onSectionsChange: {
      description: "Callback function called when sections are modified",
      action: "sections-changed",
    },
    availableConcepts: {
      description: "Array of available concepts for selection",
      control: { type: "object" },
    },
    disabled: {
      description: "Whether the component is in disabled state",
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CourseStructure>;

// Story component wrapper to handle state for interactive demos
const CourseStructureWithState = (args: {
  sections?: Section[];
  availableConcepts?: ConceptType[];
  courseId: string;
  onSectionsChange?: (sections: Section[]) => void;
}) => {
  const [sections, setSections] = useState<Section[]>(args.sections || []);

  return (
    <CourseStructure
      {...args}
      courseId={args.courseId}
      sections={sections}
      availableConcepts={args.availableConcepts || []}
      onSectionsChange={(newSections) => {
        setSections(newSections);
        args.onSectionsChange?.(newSections);
      }}
    />
  );
};

// Default state with multiple sections
export const WithSections: Story = {
  render: CourseStructureWithState,
  args: {
    courseId: "course-123",
    sections: mockSections,
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Course structure with multiple sections and lessons populated, including concept assignments. This version supports interactive drag and drop!",
      },
    },
  },
};

// Empty state - no sections
export const Empty: Story = {
  args: {
    courseId: "course-456",
    sections: [],
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: "Empty course structure ready for content creation.",
      },
    },
  },
};

// Single section with lessons
export const SingleSection: Story = {
  args: {
    courseId: "course-789",
    sections: [mockSections[0]],
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Course structure with a single section containing multiple lessons and concept assignments.",
      },
    },
  },
};

// Section with no lessons
export const SectionWithoutLessons: Story = {
  args: {
    courseId: "course-101",
    sections: [
      {
        id: "empty-section",
        title: "Empty Section",
        description: "This section has no lessons yet",
        order: 0,
        conceptIds: ["1", "2"],
        lessons: [],
      },
    ],
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A section that doesn't have any lessons added yet, but has concepts assigned.",
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  args: {
    courseId: "course-111",
    sections: mockSections,
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: true,
  },
  parameters: {
    docs: {
      description: {
        story: "Course structure in disabled state - no interactions allowed.",
      },
    },
  },
};

// Sections with empty titles (new sections)
export const NewSections: Story = {
  render: CourseStructureWithState,
  args: {
    courseId: "course-222",
    sections: [
      {
        id: "new-section-1",
        title: "",
        description: "",
        order: 0,
        conceptIds: [],
        lessons: [],
      },
      {
        id: "new-section-2",
        title: "",
        description: "",
        order: 1,
        conceptIds: [],
        lessons: [
          {
            id: "new-lesson-1",
            title: "",
            description: "",
            content: null,
            order: 0,
            conceptIds: [],
            media: [],
          },
        ],
      },
    ],
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Newly created sections and lessons with empty fields, ready for editing. Try expanding sections and filling in the titles and descriptions. This story demonstrates the editing workflow for new content.",
      },
    },
  },
};

// Large course structure
export const LargeCourse: Story = {
  render: CourseStructureWithState,
  args: {
    courseId: "course-333",
    sections: [
      ...mockSections,
      {
        id: "section-4",
        title: "Advanced Topics",
        description: "Complex concepts and advanced implementations",
        order: 3,
        conceptIds: ["5", "6", "7"],
        lessons: [
          {
            id: "lesson-4-1",
            title: "Performance Optimization",
            description: "Making your applications faster and more efficient",
            content: null,
            order: 0,
            conceptIds: ["1"],
            media: [],
          },
          {
            id: "lesson-4-2",
            title: "Security Considerations",
            description:
              "Protecting your application from common vulnerabilities",
            content: null,
            order: 1,
            conceptIds: ["5", "8"],
            media: [],
          },
          {
            id: "lesson-4-3",
            title: "Testing Strategies",
            description: "Comprehensive testing approaches",
            content: null,
            order: 2,
            conceptIds: ["1"],
            media: [],
          },
          {
            id: "lesson-4-4",
            title: "Deployment and DevOps",
            description: "Getting your application to production",
            content: null,
            order: 3,
            conceptIds: ["1"],
            media: [],
          },
        ],
      },
      {
        id: "section-5",
        title: "Final Project",
        description: "Capstone project bringing everything together",
        order: 4,
        conceptIds: ["1", "2", "3", "4", "5", "6", "7", "8"],
        lessons: [
          {
            id: "lesson-5-1",
            title: "Project Planning",
            description: "Designing your final project",
            content: null,
            order: 0,
            conceptIds: ["3", "5"],
            media: [],
          },
          {
            id: "lesson-5-2",
            title: "Implementation",
            description: "Building the complete application",
            content: null,
            order: 1,
            conceptIds: ["1", "2", "4", "8"],
            media: [],
          },
          {
            id: "lesson-5-3",
            title: "Review and Feedback",
            description: "Peer review and instructor feedback",
            content: null,
            order: 2,
            conceptIds: ["1"],
            media: [],
          },
        ],
      },
    ],
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "A comprehensive course structure with many sections and lessons, showcasing the full feature set including interactive drag & drop and concept management. Try reordering the many sections and lessons!",
      },
    },
  },
};

// Story specifically for demonstrating drag and drop
export const DragAndDropDemo: Story = {
  render: CourseStructureWithState,
  args: {
    courseId: "course-dnd",
    sections: mockSections,
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Interactive demo showing drag & drop functionality - try dragging sections and lessons to reorder them, or move lessons between sections. The reordering will actually work in this story!",
      },
    },
  },
};

// Interactive playground for testing all functionality
export const InteractivePlayground: Story = {
  render: CourseStructureWithState,
  args: {
    courseId: "course-playground",
    sections: mockSections,
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts,
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Full interactive playground where you can test all functionality: drag & drop reordering, adding/editing sections and lessons, concept selection, and more. Changes will persist within this story session.",
      },
    },
  },
};

// Story with limited concepts to show selection behavior
export const LimitedConcepts: Story = {
  args: {
    courseId: "course-limited",
    sections: [mockSections[0]],
    onSectionsChange: action("sections-changed"),
    availableConcepts: mockConcepts.slice(0, 3), // Only first 3 concepts
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Course structure with limited available concepts to demonstrate concept selection behavior.",
      },
    },
  },
};
