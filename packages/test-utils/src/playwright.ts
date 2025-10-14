// Playwright configuration and utilities
import { defineConfig, devices } from "@playwright/test";

export const playwrightConfig = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});

// Playwright test utilities
export class TestHelpers {
  static async login(
    page: any,
    email = "test@example.com",
    password = "password123",
  ) {
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', email);
    await page.fill('[data-testid="password-input"]', password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/");
  }

  static async logout(page: any) {
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    await page.waitForURL("/login");
  }

  static async createCourse(page: any, courseData: any) {
    await page.goto("/instructor/courses/new");
    await page.fill('[data-testid="course-title"]', courseData.title);
    await page.fill(
      '[data-testid="course-description"]',
      courseData.description,
    );
    await page.click('[data-testid="save-course"]');
    await page.waitForURL("/instructor/courses");
  }

  static async enrollInCourse(page: any, courseSlug: string) {
    await page.goto(`/courses/${courseSlug}`);
    await page.click('[data-testid="enroll-button"]');
    await page.waitForSelector('[data-testid="enrolled-badge"]');
  }

  static async completeLesson(page: any, courseSlug: string, lessonId: string) {
    await page.goto(`/courses/${courseSlug}/lessons/${lessonId}`);
    await page.waitForLoadState("networkidle");
    await page.click('[data-testid="complete-lesson"]');
    await page.waitForSelector('[data-testid="lesson-completed"]');
  }
}

// Custom page object models
export class LoginPage {
  constructor(private page: any) {}

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.page.fill('[data-testid="email-input"]', email);
    await this.page.fill('[data-testid="password-input"]', password);
    await this.page.click('[data-testid="login-button"]');
  }

  async getErrorMessage() {
    return await this.page.textContent('[data-testid="error-message"]');
  }
}

export class CoursePage {
  constructor(private page: any) {}

  async goto(slug: string) {
    await this.page.goto(`/courses/${slug}`);
  }

  async enroll() {
    await this.page.click('[data-testid="enroll-button"]');
  }

  async isEnrolled() {
    return await this.page.isVisible('[data-testid="enrolled-badge"]');
  }

  async getTitle() {
    return await this.page.textContent('[data-testid="course-title"]');
  }
}
