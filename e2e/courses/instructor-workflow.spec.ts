import { test, expect } from "../fixtures";

test.describe("Instructor Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as instructor
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "instructor@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/");
  });

  test("instructor can create a new course", async ({ page }) => {
    await page.goto("/instructor/courses/new");

    // Fill course form
    await page.fill('[data-testid="course-title"]', "New Test Course");
    await page.fill(
      '[data-testid="course-description"]',
      "A comprehensive test course",
    );
    await page.selectOption('[data-testid="course-category"]', "programming");

    // Save course
    await page.click('[data-testid="save-course"]');

    // Should redirect to courses list
    await expect(page).toHaveURL("/instructor/courses");
    await expect(page.locator("text=New Test Course")).toBeVisible();
  });

  test("instructor can edit course details", async ({ page }) => {
    await page.goto("/instructor/courses/1");

    // Click edit button
    await page.click('[data-testid="edit-course"]');

    // Update course title
    await page.fill('[data-testid="course-title"]', "Updated Course Title");
    await page.click('[data-testid="save-course"]');

    // Should see updated title
    await expect(page.locator("text=Updated Course Title")).toBeVisible();
  });

  test("instructor can add lessons to course", async ({ page }) => {
    await page.goto("/instructor/courses/1");

    // Click add lesson button
    await page.click('[data-testid="add-lesson"]');

    // Fill lesson form
    await page.fill('[data-testid="lesson-title"]', "Introduction to Testing");
    await page.fill(
      '[data-testid="lesson-content"]',
      "This lesson covers the basics of testing...",
    );
    await page.fill('[data-testid="lesson-duration"]', "30");

    // Save lesson
    await page.click('[data-testid="save-lesson"]');

    // Should see new lesson in list
    await expect(page.locator("text=Introduction to Testing")).toBeVisible();
  });

  test("instructor can view course analytics", async ({ page }) => {
    await page.goto("/instructor/courses/1");

    // Click analytics tab
    await page.click('[data-testid="analytics-tab"]');

    // Should see analytics data
    await expect(
      page.locator('[data-testid="enrollment-count"]'),
    ).toBeVisible();
    await expect(page.locator('[data-testid="completion-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-rating"]')).toBeVisible();
  });
});
