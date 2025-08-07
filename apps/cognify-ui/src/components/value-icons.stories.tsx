import type { Meta, StoryObj } from "@storybook/react";

import {
  CommunityIcon,
  EmpowermentIcon,
  InterconnectedLearningIcon,
} from "./value-icons";

const meta: Meta = {
  title: "Components/ValueIcons",
};

export default meta;

export const InterconnectedLearning: StoryObj = {
  render: () => <InterconnectedLearningIcon />,
};

export const Empowerment: StoryObj = {
  render: () => <EmpowermentIcon />,
};

export const Community: StoryObj = {
  render: () => <CommunityIcon />,
};
