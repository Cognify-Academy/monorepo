import { AuthProvider } from "@/contexts/auth";
import type { Meta, StoryObj } from "@storybook/react";
import ReadyToLearn from "./ready-to-learn";

const meta: Meta<typeof ReadyToLearn> = {
  title: "Components/ReadyToLearn",
  component: ReadyToLearn,
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <div className="w-full max-w-4xl p-4">
          <Story />
        </div>
      </AuthProvider>
    ),
  ],
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ReadyToLearn>;

export const NotAuthenticated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Shows the component when user is not authenticated (default state).",
      },
    },
  },
};

export const WithBackground: Story = {
  parameters: {
    docs: {
      description: {
        story: "Component displayed with a gray background to show contrast.",
      },
    },
  },
  decorators: [
    (Story) => (
      <AuthProvider>
        <div className="min-h-screen w-full max-w-4xl bg-gray-50 p-4">
          <Story />
        </div>
      </AuthProvider>
    ),
  ],
};

export const Responsive: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Component in different screen sizes to test responsive behavior.",
      },
    },
    viewport: {
      defaultViewport: "mobile1",
    },
  },
};

export const Desktop: Story = {
  parameters: {
    docs: {
      description: {
        story: "Component on desktop viewport.",
      },
    },
    viewport: {
      defaultViewport: "desktop",
    },
  },
};

export const Tablet: Story = {
  parameters: {
    docs: {
      description: {
        story: "Component on tablet viewport.",
      },
    },
    viewport: {
      defaultViewport: "tablet",
    },
  },
};
