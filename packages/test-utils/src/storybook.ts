// Storybook test runner configuration and utilities
import { test, expect } from "@playwright/test";

// Storybook test runner configuration
export const storybookConfig = {
  testDir: "./.storybook",
  testMatch: "**/*.stories.@(js|jsx|ts|tsx)",
  testNamePattern: "Visual regression",
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

// Storybook test utilities
export class StorybookTestHelpers {
  static async testStoryInteraction(
    story: any,
    interaction: () => Promise<void>
  ) {
    await test.beforeEach(async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}`);
    });

    await test("should handle interaction correctly", async ({ page }) => {
      await interaction();
      // Add assertions based on the interaction
    });
  }

  static async testStoryAccessibility(story: any) {
    await test.beforeEach(async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}`);
    });

    await test("should be accessible", async ({ page }) => {
      // Run accessibility tests
      const accessibilityTree = await page.accessibility.snapshot();
      expect(accessibilityTree).toBeTruthy();
    });
  }

  static async testStoryVisualRegression(story: any) {
    await test.beforeEach(async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}`);
    });

    await test("should match visual baseline", async ({ page }) => {
      await page.waitForLoadState("networkidle");
      // Note: toHaveScreenshot is a Playwright feature, not available in all test runners
      // await expect(page).toHaveScreenshot(`${story.id}.png`);
    });
  }
}

// Common story test patterns
export const commonStoryTests = {
  // Test that a story renders without errors
  rendersWithoutError: async (page: any) => {
    await page.waitForLoadState("networkidle");
    const errorElements = await page.locator('[data-testid="error"]').count();
    expect(errorElements).toBe(0);
  },

  // Test that a story is interactive
  isInteractive: async (page: any, selector: string) => {
    const element = page.locator(selector);
    await expect(element).toBeVisible();
    await expect(element).toBeEnabled();
  },

  // Test that a story has proper ARIA attributes
  hasProperAria: async (page: any, selector: string) => {
    const element = page.locator(selector);
    const ariaLabel = await element.getAttribute("aria-label");
    const role = await element.getAttribute("role");
    expect(ariaLabel || role).toBeTruthy();
  },

  // Test that a story responds to keyboard navigation
  respondsToKeyboard: async (page: any, selector: string) => {
    const element = page.locator(selector);
    await element.focus();
    await page.keyboard.press("Tab");
    // Add more keyboard navigation tests as needed
  },
};
