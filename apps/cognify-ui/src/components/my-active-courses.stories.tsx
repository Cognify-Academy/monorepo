import type { Meta, StoryObj } from "@storybook/react";
import { MyActiveCourses } from "./my-active-courses";

const meta: Meta<typeof MyActiveCourses> = {
  title: "Components/MyActiveCourses",
  component: MyActiveCourses,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A section component that displays a user's active courses with progress indicators and course details.",
      },
    },
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MyActiveCourses>;

export const Default: Story = {
  name: "Default Courses",
  parameters: {
    docs: {
      description: {
        story:
          "The default view with sample courses showing different progress states.",
      },
    },
  },
};

export const SingleCourse: Story = {
  name: "Single Course",
  args: {
    courses: [
      {
        id: "1",
        title: "Advanced React Patterns",
        description:
          "Deep dive into advanced React patterns and optimization techniques.",
        completedConcepts: 8,
        totalConcepts: 15,
        estimatedTimeLeft: "3 weeks left",
        iconColor: "bg-blue-600",
        iconPath:
          "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
        isCompleted: false,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Display with a single course for testing individual course card appearance.",
      },
    },
  },
};

export const CompletedCourses: Story = {
  name: "Completed Courses",
  args: {
    courses: [
      {
        id: "1",
        title: "JavaScript Fundamentals",
        description:
          "You've mastered the basics of JavaScript! Time to move on to advanced topics.",
        completedConcepts: 20,
        totalConcepts: 20,
        estimatedTimeLeft: "Completed!",
        iconColor: "bg-gray-400",
        iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        isCompleted: true,
      },
      {
        id: "2",
        title: "CSS Mastery",
        description:
          "Congratulations! You've completed all CSS concepts and are ready for frameworks.",
        completedConcepts: 15,
        totalConcepts: 15,
        estimatedTimeLeft: "Completed!",
        iconColor: "bg-gray-400",
        iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        isCompleted: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows completed courses with 100% progress and completion status.",
      },
    },
  },
};

export const MixedProgress: Story = {
  name: "Mixed Progress States",
  args: {
    courses: [
      {
        id: "1",
        title: "Frontend Development",
        description: "Just getting started with modern frontend technologies.",
        completedConcepts: 1,
        totalConcepts: 25,
        estimatedTimeLeft: "12 weeks left",
        iconColor: "bg-red-600",
        iconPath:
          "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
        isCompleted: false,
      },
      {
        id: "2",
        title: "Backend Engineering",
        description:
          "Making good progress on server-side development concepts.",
        completedConcepts: 18,
        totalConcepts: 22,
        estimatedTimeLeft: "1 week left",
        iconColor: "bg-green-600",
        iconPath: "M13 10V3L4 14h7v7l9-11h-7z",
        isCompleted: false,
      },
      {
        id: "3",
        title: "Database Design",
        description:
          "You've successfully completed this comprehensive database course!",
        completedConcepts: 12,
        totalConcepts: 12,
        estimatedTimeLeft: "Completed!",
        iconColor: "bg-gray-400",
        iconPath: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
        isCompleted: true,
      },
    ],
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows courses with various progress states: just started, nearly complete, and finished.",
      },
    },
  },
};

export const EmptyState: Story = {
  name: "No Courses",
  args: {
    courses: [],
  },
  parameters: {
    docs: {
      description: {
        story: "Shows the component when there are no courses to display.",
      },
    },
  },
};
