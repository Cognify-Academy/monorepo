import { test, expect } from "../fixtures";

test.describe("Course Enrollment", () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "test@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/");
  });

  test("user can enroll in a course", async ({ coursePage, page }) => {
    await coursePage.goto("test-course");

    // Should see course details
    await expect(page.locator('[data-testid="course-title"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="course-description"]'),
    ).toBeVisible();

    // Enroll in course
    await coursePage.enroll();

    // Should see enrolled state
    await expect(coursePage.isEnrolled()).resolves.toBe(true);
    await expect(page.locator('[data-testid="enrolled-badge"]')).toBeVisible();
  });

  test("enrolled user can access course content", async ({
    coursePage,
    page,
  }) => {
    // First enroll in course
    await coursePage.goto("test-course");
    await coursePage.enroll();

    // Should be able to access lessons
    await expect(page.locator('[data-testid="lessons-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="lesson-item"]')).toHaveCount(3);
  });

  test("user can complete a lesson", async ({ page }) => {
    // Navigate to a lesson
    await page.goto("/courses/test-course/lessons/lesson-1");

    // Should see lesson content
    await expect(page.locator('[data-testid="lesson-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible();

    // Complete the lesson
    await page.click('[data-testid="complete-lesson"]');

    // Should see completion confirmation
    await expect(
      page.locator('[data-testid="lesson-completed"]'),
    ).toBeVisible();
  });

  test("course progress is tracked correctly", async ({ page }) => {
    await page.goto("/courses/test-course");

    // Should see progress indicator
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="progress-text"]')).toContainText(
      "0%",
    );

    // Complete first lesson
    await page.goto("/courses/test-course/lessons/lesson-1");
    await page.click('[data-testid="complete-lesson"]');

    // Check progress updated
    await page.goto("/courses/test-course");
    await expect(page.locator('[data-testid="progress-text"]')).toContainText(
      "33%",
    );
  });
});
