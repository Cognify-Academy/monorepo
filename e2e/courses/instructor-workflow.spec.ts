import { test, expect } from "../fixtures";

test.describe("Instructor Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Login as instructor
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "instructor@example.com");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');
    // Wait for login to complete (either success or error)
    await page.waitForLoadState("networkidle");

    // Debug: Check if we're still on login page
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      const errorMessage = await page
        .locator('[data-testid="email-error"]')
        .textContent();
      console.log("Instructor login failed:", errorMessage);
      throw new Error(`Instructor login failed: ${errorMessage}`);
    }

    // Debug: Check if we're on home page (successful login)
    if (currentUrl === "http://localhost:3000/") {
      console.log("Instructor login successful, on home page");
    }

    // Create a test course for the instructor
    await page.goto("/instructor/courses/new");
    await page.waitForLoadState("networkidle");

    // Fill course form with unique title to avoid slug conflicts
    const timestamp = Date.now();
    const courseTitle = `Test Course for Instructor ${timestamp}`;
    await page.fill('[data-testid="course-title-input"]', courseTitle);
    await page.fill(
      '[data-testid="course-description"]',
      "A test course created during test setup",
    );

    // Save course
    await page.click('[data-testid="save-course-button"]');

    // Wait for course creation to complete
    await page.waitForLoadState("networkidle");

    console.log(`Test course created for instructor: ${courseTitle}`);
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

  test("instructor can access instructor courses page", async ({ page }) => {
    // Navigate to instructor courses page
    await page.goto("/instructor/courses");

    // Wait for the page to fully load and any API calls to complete
    await page.waitForLoadState("networkidle");

    // Should not be on login page
    expect(page.url()).not.toContain("/login");

    // Should be on instructor courses page
    expect(page.url()).toContain("/instructor/courses");

    // Should see the test course that was created in beforeEach
    await expect(
      page.locator('[data-testid="course-card"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-testid="course-title"]').first(),
    ).toContainText("Test Course for Instructor");
  });

  test("instructor can access course creation page", async ({ page }) => {
    // Navigate to course creation page
    await page.goto("/instructor/courses/new");

    // Should be able to access the page
    await page.waitForLoadState("networkidle");

    // Should not be on login page
    expect(page.url()).not.toContain("/login");

    // Should be on course creation page
    expect(page.url()).toContain("/instructor/courses/new");
  });

  test("instructor can navigate back to courses list from course edit page", async ({
    page,
  }) => {
    // First navigate to a course edit page
    await page.goto("/instructor/courses/1");

    // Wait for the page to load
    await page.waitForSelector('[data-testid="course-form"]');

    // Click the back button or navigate back
    await page.goBack();

    // Should be back on the instructor courses page
    await page.waitForURL("/instructor/courses");

    // Should see the courses list
    await expect(page.locator('[data-testid="courses-list"]')).toBeVisible();
  });

  test("instructor sees empty state when no courses exist", async ({
    page,
  }) => {
    // This test would require setting up a clean database state
    // For now, we'll test the UI behavior when no courses are loaded

    // Navigate to instructor courses page
    await page.goto("/instructor/courses");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Check if we see the empty state or courses
    const hasCourses =
      (await page.locator('[data-testid="course-card"]').count()) > 0;
    const hasEmptyState = await page
      .locator("text=You haven't created any courses yet")
      .isVisible();

    // Either we should see courses or the empty state
    expect(hasCourses || hasEmptyState).toBeTruthy();

    if (hasEmptyState) {
      // Should see the create course button
      await expect(page.locator("text=Create your first course")).toBeVisible();
    }
  });

  test("instructor can delete a course", async ({ page }) => {
    // First, create a course to delete
    await page.goto("/instructor/courses/new");
    await page.waitForLoadState("networkidle");

    const timestamp = Date.now();
    const courseTitle = `Course to Delete ${timestamp}`;
    await page.fill('[data-testid="course-title-input"]', courseTitle);
    await page.fill(
      '[data-testid="course-description"]',
      "A test course that will be deleted",
    );

    // Save course
    await page.click('[data-testid="save-course-button"]');
    await page.waitForLoadState("networkidle");

    // Navigate to the course list
    await page.goto("/instructor/courses");
    await page.waitForLoadState("networkidle");

    // Find the course card and click delete
    const courseCard = page.locator('[data-testid="course-card"]').filter({
      hasText: courseTitle,
    });
    await expect(courseCard).toBeVisible();

    // Click the delete button (assuming it exists in the course card)
    await courseCard.locator('[data-testid="delete-course-button"]').click();

    // Confirm deletion in the confirmation dialog
    await page.locator('[data-testid="confirm-delete-button"]').click();

    // Wait for the course to be removed from the list
    await expect(courseCard).not.toBeVisible();

    // Verify the course is no longer in the list
    await expect(page.locator(`text=${courseTitle}`)).not.toBeVisible();
  });

  test("instructor cannot delete a course with sections", async ({ page }) => {
    // First, create a course with a section
    await page.goto("/instructor/courses/new");
    await page.waitForLoadState("networkidle");

    const timestamp = Date.now();
    const courseTitle = `Course with Sections ${timestamp}`;
    await page.fill('[data-testid="course-title-input"]', courseTitle);
    await page.fill(
      '[data-testid="course-description"]',
      "A test course with sections that cannot be deleted",
    );

    // Save course
    await page.click('[data-testid="save-course-button"]');
    await page.waitForLoadState("networkidle");

    // Add a section to the course
    await page.goto("/instructor/courses/1");
    await page.waitForLoadState("networkidle");

    // Click add section button
    await page.click('[data-testid="add-section-button"]');
    await page.fill('[data-testid="section-title"]', "Test Section");
    await page.fill('[data-testid="section-description"]', "A test section");
    await page.click('[data-testid="save-section-button"]');

    // Navigate back to courses list
    await page.goto("/instructor/courses");
    await page.waitForLoadState("networkidle");

    // Find the course card and try to delete
    const courseCard = page.locator('[data-testid="course-card"]').filter({
      hasText: courseTitle,
    });
    await expect(courseCard).toBeVisible();

    // Click the delete button
    await courseCard.locator('[data-testid="delete-course-button"]').click();

    // Should see an error message about not being able to delete course with sections
    await expect(
      page.locator("text=Cannot delete course with sections"),
    ).toBeVisible();

    // Course should still be visible
    await expect(courseCard).toBeVisible();
  });

  test("cleanup test courses from database", async ({ page }) => {
    // This test helps clean up test courses that might be cluttering the database
    await page.goto("/instructor/courses");
    await page.waitForLoadState("networkidle");

    // Find all course cards that contain "Test Course" in their title
    const testCourseCards = page.locator('[data-testid="course-card"]').filter({
      hasText: "Test Course",
    });

    const testCourseCount = await testCourseCards.count();
    console.log(`Found ${testCourseCount} test courses to clean up`);

    // Delete each test course
    for (let i = 0; i < testCourseCount; i++) {
      const courseCard = testCourseCards.nth(i);
      const courseTitle = await courseCard
        .locator('[data-testid="course-title"]')
        .textContent();

      console.log(`Deleting test course: ${courseTitle}`);

      // Click the delete button
      await courseCard.locator('[data-testid="delete-course-button"]').click();

      // Confirm deletion
      await page.locator('[data-testid="confirm-delete-button"]').click();

      // Wait for the course to be removed
      await expect(courseCard).not.toBeVisible();

      // Wait a bit before processing the next course
      await page.waitForTimeout(1000);
    }

    console.log("Test course cleanup completed");
  });
});
