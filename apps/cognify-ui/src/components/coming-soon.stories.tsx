import type { Meta, StoryObj } from "@storybook/react";
import { ComingSoon } from "./coming-soon";

const meta: Meta<typeof ComingSoon> = {
  title: "Components/Coming Soon",
  component: ComingSoon,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    title: {
      control: "text",
      description: "The main title for the section",
    },
    subtitle: {
      control: "text",
      description: "The subtitle text below the main title",
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the section",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomTitle: Story = {
  args: {
    title: "Coming Soon Courses",
    subtitle: "Exciting new learning paths are in development",
  },
};

export const CustomCourses: Story = {
  args: {
    title: "Advanced Learning Paths",
    subtitle: "Master complex topics through interconnected knowledge",
    courses: [
      {
        id: "advanced-ml",
        title: "Advanced Machine Learning",
        description:
          "Deep dive into neural networks, deep learning, and advanced ML algorithms.",
        icon: (
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
        ),
        iconBgColor: "bg-indigo-600",
        conceptsCount: 25,
      },
      {
        id: "blockchain",
        title: "Blockchain Development",
        description:
          "Learn smart contracts, DeFi protocols, and decentralized applications.",
        icon: (
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        ),
        iconBgColor: "bg-yellow-600",
        conceptsCount: 20,
      },
      {
        id: "ai-ethics",
        title: "AI Ethics & Governance",
        description:
          "Explore the ethical implications and governance frameworks for AI systems.",
        icon: (
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        ),
        iconBgColor: "bg-red-600",
        conceptsCount: 15,
      },
    ],
  },
};

export const SingleCourse: Story = {
  args: {
    title: "Featured Course",
    subtitle: "Our most anticipated learning path",
    courses: [
      {
        id: "quantum-computing",
        title: "Quantum Computing Fundamentals",
        description:
          "Master quantum algorithms, quantum gates, and quantum programming languages.",
        icon: (
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
            />
          </svg>
        ),
        iconBgColor: "bg-purple-600",
        conceptsCount: 30,
      },
    ],
  },
};

export const DarkTheme: Story = {
  args: {
    title: "Dark Mode Preview",
    subtitle: "Coming soon with dark theme support",
    className: "bg-gray-900 text-white",
  },
  parameters: {
    backgrounds: {
      default: "dark",
    },
  },
};

export const CompactLayout: Story = {
  args: {
    title: "Compact Course Cards",
    subtitle: "Optimized for smaller screens",
    className: "py-12",
  },
};

export const EmptyState: Story = {
  args: {
    title: "No Courses Available",
    subtitle: "Check back soon for new learning paths",
    courses: [],
  },
};
