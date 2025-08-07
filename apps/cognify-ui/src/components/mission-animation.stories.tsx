import type { Meta, StoryObj } from "@storybook/react";

import MissionAnimation from "./mission-animation";

const meta: Meta<typeof MissionAnimation> = {
  title: "Components/MissionAnimation",
  component: MissionAnimation,
};

export default meta;

type Story = StoryObj<typeof MissionAnimation>;

export const Default: Story = {
  render: () => <MissionAnimation />,
};
