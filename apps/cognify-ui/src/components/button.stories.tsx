import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["button", "submit", "reset"],
      description: "The type of button",
    },
    className: {
      control: { type: "text" },
      description: "Additional CSS classes",
    },
    disabled: {
      control: { type: "boolean" },
      description: "Disabled state",
    },
    onClick: { action: "clicked" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Button",
  },
};

export const WithText: Story = {
  args: {
    children: "Click me",
  },
};

export const LongText: Story = {
  args: {
    children: "This is a longer button text",
  },
};

export const Disabled: Story = {
  args: {
    children: "Disabled Button",
    disabled: true,
  },
};

export const SubmitType: Story = {
  args: {
    type: "submit",
    children: "Submit Form",
  },
};

export const WithCustomClass: Story = {
  args: {
    children: "Custom Styled",
    className: "bg-green-600 hover:bg-green-500",
  },
};

export const WithIcon: Story = {
  args: {
    children: (
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
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        Add Item
      </>
    ),
  },
};

export const Playground: Story = {
  args: {
    children: "Playground Button",
    type: "button",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Use the controls below to experiment with different button configurations.",
      },
    },
  },
};
