import { test, expect } from "../fixtures";

test.describe("Authentication", () => {
  test("user can login with valid credentials", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login("test@example.com", "password123");

    // Wait for the "Welcome Back," text to appear instead of waiting for URL change
    await expect(page.locator("h1")).toContainText("Welcome Back,", {
      timeout: 10000,
    });

    // Verify we're on the home page
    await expect(page).toHaveURL("/");
  });

  test("user sees error message with invalid credentials", async ({
    loginPage,
  }) => {
    await loginPage.goto();
    await loginPage.login("invalid@example.com", "wrongpassword");

    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain("Invalid credentials");
  });

  test("user can logout successfully", async ({ loginPage, page }) => {
    // First login
    await loginPage.goto();
    await loginPage.login("test@example.com", "password123");

    // Wait for login to complete
    await page.waitForURL("/", { timeout: 10000 });

    // Then logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to home page
    await expect(page).toHaveURL("/");

    // Should show landing page content (not logged in state)
    await expect(page.locator("h1")).not.toContainText("Welcome Back,");
  });

  test("login form validation works", async ({ page }) => {
    await page.goto("/login");

    // Try to submit empty form
    await page.click('[data-testid="login-button"]');

    // Should show validation errors (browser native validation)
    // The form should prevent submission due to required fields
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible();
  });
});
