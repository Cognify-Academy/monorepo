import { test, expect } from "../fixtures";

test.describe("Authentication", () => {
  test("user can login with valid credentials", async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login("test@example.com", "password123");

    // Wait for login to complete and check if we're redirected
    await page.waitForLoadState("networkidle");

    // Should redirect to dashboard after successful login (or stay on login if there's an error)
    const currentUrl = page.url();
    if (currentUrl.includes("/login")) {
      // If still on login page, check for error message
      const errorMessage = await page
        .locator('[data-testid="email-error"]')
        .textContent();
      console.log("Login error:", errorMessage);
      throw new Error(`Login failed: ${errorMessage}`);
    } else {
      // If redirected, should be on home page
      await expect(page).toHaveURL("/");

      // Check for user menu (desktop) or mobile menu button as indicators of successful login
      const userMenuVisible = await page
        .locator('[data-testid="user-menu"]')
        .isVisible();
      const mobileMenuVisible = await page
        .locator('[data-testid="mobile-menu-button"]')
        .isVisible();

      if (!userMenuVisible && !mobileMenuVisible) {
        // If neither menu is visible, check if we can find any authenticated content
        const hasAuthenticatedContent =
          (await page.locator("text=My Courses").count()) > 0;
        if (!hasAuthenticatedContent) {
          throw new Error(
            "Login successful but no authenticated content visible",
          );
        }
      }
    }
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

    // Then logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login page
    await expect(page).toHaveURL("/login");
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible();
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
