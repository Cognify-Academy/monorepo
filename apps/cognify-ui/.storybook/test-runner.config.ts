import type { PlaywrightTestConfig } from "@playwright/test";
import { storybookConfig } from "@test-utils/storybook";

const config: PlaywrightTestConfig = {
  ...storybookConfig,
  testDir: "../.storybook",
  testMatch: "**/*.stories.@(js|jsx|ts|tsx)",
  testNamePattern: "Visual regression|Accessibility|Interaction",
  retries: 2,
  timeout: 30000,
  use: {
    baseURL: "http://localhost:6006",
  },
  webServer: {
    command: "bun run storybook",
    url: "http://localhost:6006",
    reuseExistingServer: !process.env.CI,
  },
};

export default config;
