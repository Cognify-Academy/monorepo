// Playwright fixtures and test utilities
import { test as base, expect } from "@playwright/test";
import { LoginPage, CoursePage } from "../packages/test-utils/src/playwright";

// Extend base test with custom fixtures
export const test = base.extend<{
  loginPage: LoginPage;
  coursePage: CoursePage;
}>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  coursePage: async ({ page }, use) => {
    const coursePage = new CoursePage(page);
    await use(coursePage);
  },
});

export { expect } from "@playwright/test";
