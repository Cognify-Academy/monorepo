import { test, expect } from "../fixtures";

test.describe("Authentication", () => {
  test("user can login with valid credentials", async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.login("test@example.com", "password123");

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL("/");
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
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

    // Should show validation errors
    await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="password-error"]')).toBeVisible();
  });
});
