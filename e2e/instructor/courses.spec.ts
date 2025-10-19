import { test, expect } from "../fixtures";

test.describe("Instructor Courses", () => {
  test("instructor can view their course list", async ({ page }) => {
    // Login as instructor (use actual test user)
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "instructor");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Wait for login to complete and redirect
    await page.waitForTimeout(2000);

    // Navigate to instructor courses
    await page.goto("/instructor/courses");

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Should not see infinite loading spinner
    const loadingSpinner = page.locator(".animate-spin");
    await expect(loadingSpinner).not.toBeVisible({ timeout: 5000 });

    // Should see the courses page heading
    await expect(page.locator("h2").first()).toBeVisible();
  });

  test("instructor can view course details", async ({ page }) => {
    // Login as instructor (use actual test user)
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "instructor");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Wait for navigation away from login page
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 10000,
    });

    // Navigate to instructor courses
    await page.goto("/instructor/courses");

    // Wait for courses to load - the course card should become visible
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCourseCard).toBeVisible({
      timeout: 15000,
    });

    // Click on the first course
    await firstCourseCard.click();

    // Should navigate to course detail page
    await page.waitForURL(/\/instructor\/courses\/.*/, { timeout: 5000 });

    // Should not see infinite loading spinner
    const loadingSpinner = page.locator(".animate-spin");
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });

    // Should see course content
    await expect(page.locator("h1, h2")).toBeVisible();
  });

  test("instructor can edit a course", async ({ page }) => {
    // Login as instructor
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "instructor");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Wait for navigation away from login page
    await page.waitForURL((url) => !url.pathname.includes("/login"), {
      timeout: 10000,
    });

    // Navigate to instructor courses
    await page.goto("/instructor/courses");

    // Wait for courses to load and get the first course card
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCourseCard).toBeVisible({ timeout: 10000 });

    // Click the course card to navigate to the edit page
    await firstCourseCard.click();

    // Wait for navigation to the course edit page
    await page.waitForURL("**/instructor/courses/*", { timeout: 10000 });

    // Should not see infinite loading spinner
    const loadingSpinner = page.locator(".animate-spin");
    await expect(loadingSpinner).not.toBeVisible({ timeout: 10000 });

    // Should see the course form
    await expect(page.locator('[data-testid="course-form"]')).toBeVisible({
      timeout: 5000,
    });

    // Should see the course structure section
    await expect(page.locator('[data-testid="course-structure"]')).toBeVisible({
      timeout: 5000,
    });
  });
});
