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

  test.skip("instructor can add a lesson to a course", async ({ page }) => {
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

    // Wait for courses to load and click on first course
    const firstCourseCard = page.locator('[data-testid="course-card"]').first();
    await expect(firstCourseCard).toBeVisible({ timeout: 10000 });
    await firstCourseCard.click();

    // Wait for course edit page to load
    await page.waitForURL("**/instructor/courses/*", { timeout: 10000 });
    await expect(page.locator('[data-testid="course-structure"]')).toBeVisible({
      timeout: 10000,
    });

    // Look for "Add Section" button - if no sections exist, create one first
    const addSectionButton = page.getByRole("button", { name: "Add Section" });
    const hasAddSectionButton = await addSectionButton.isVisible();

    if (hasAddSectionButton) {
      await addSectionButton.click();
      await page.waitForTimeout(1000);
    }

    // Now look for any text inputs (sections use TextInput component with no specific placeholder)
    // Wait for course structure to have loaded sections
    await page.waitForTimeout(1000);

    // Find "Add Lesson" button - it should be visible if a section is expanded
    let addLessonButton = page.getByRole("button", { name: "Add Lesson" });
    let isLessonButtonVisible = await addLessonButton
      .isVisible()
      .catch(() => false);

    // If not visible, we need to expand a section first
    if (!isLessonButtonVisible) {
      // Click any button to try to expand a section
      const buttons = await page.locator("button").all();
      for (const button of buttons) {
        await button.click();
        await page.waitForTimeout(300);
        isLessonButtonVisible = await addLessonButton
          .isVisible()
          .catch(() => false);
        if (isLessonButtonVisible) break;
      }
    }

    await expect(addLessonButton).toBeVisible({ timeout: 5000 });

    // Count existing lesson title inputs before adding
    const lessonsBefore = await page
      .locator('input[placeholder="Lesson title"]')
      .count();

    // Click to add a new lesson
    await addLessonButton.click();

    // Wait for new lesson to appear
    await expect(page.locator('input[placeholder="Lesson title"]')).toHaveCount(
      lessonsBefore + 1,
      { timeout: 5000 },
    );

    // Fill in the new lesson title
    const newLessonTitleInput = page
      .locator('input[placeholder="Lesson title"]')
      .nth(lessonsBefore);
    const lessonTitle = "E2E Test Lesson " + Date.now();
    await newLessonTitleInput.fill(lessonTitle);

    // Expand the lesson to fill description
    const toggleButtons = await page.locator("button").all();
    for (const btn of toggleButtons) {
      const ariaExpanded = await btn
        .getAttribute("aria-expanded")
        .catch(() => null);
      if (ariaExpanded === "false" || (await btn.locator("svg").count()) > 0) {
        await btn.click();
        await page.waitForTimeout(300);
        const descTextarea = page.locator(
          'textarea[placeholder="Lesson description"]',
        );
        if (await descTextarea.isVisible().catch(() => false)) {
          break;
        }
      }
    }

    // Fill description
    const descriptionTextarea = page
      .locator('textarea[placeholder="Lesson description"]')
      .last();
    await descriptionTextarea.fill("E2E test lesson with optional content");

    // Save the lesson
    const saveButtons = page.getByRole("button").filter({ hasText: /Save/i });
    await saveButtons.last().click();

    // Wait for save to complete
    await page.waitForTimeout(2000);

    // Verify no 422 error (which would indicate the content field validation failed)
    const error422 = page.locator("text=/422|unprocessable entity/i");
    await expect(error422).not.toBeVisible();
  });

  test("API accepts lesson creation with optional content", async ({
    page,
    request,
  }) => {
    // Login to get auth token
    await page.goto("/login");
    await page.fill('[data-testid="email-input"]', "instructor");
    await page.fill('[data-testid="password-input"]', "password123");
    await page.click('[data-testid="login-button"]');

    // Wait for login and get token from localStorage
    await page.waitForTimeout(2000);
    const token = await page.evaluate(() =>
      localStorage.getItem("accessToken"),
    );
    expect(token).toBeTruthy();

    // Make API request to create a lesson with minimal data (no content)
    const response = await request.post(
      "http://localhost:3333/api/v1/instructor/courses/cmgqy6juw000j30ed0dhbc0s2/sections/test-section-e2e/lessons",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        data: {
          title: "API Test Lesson " + Date.now(),
          description: "Testing that content is optional",
          conceptIds: [],
          // Note: content is not provided - this should work with the API fix
        },
      },
    );

    // Should succeed (200-299) and not return 422
    const status = response.status();
    const responseBody = await response.text();

    // Log for debugging if it fails
    if (status === 422) {
      console.log("Got 422 error - content validation failed:", responseBody);
    } else if (!response.ok()) {
      console.log(`Got ${status} error:`, responseBody);
    }

    expect(status).not.toBe(422);
    expect(response.ok()).toBe(true);
  });
});
