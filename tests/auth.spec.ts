import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto("/");
  });

  test("should navigate to login page", async ({ page }) => {
    await page.click("text=Login");
    await expect(page).toHaveURL(/.*auth\/login/);
    await expect(page.locator("h1")).toContainText("Login");
  });

  test("should navigate to sign up page", async ({ page }) => {
    await page.goto("/auth/login");
    await page.click("text=Sign up");
    await expect(page).toHaveURL(/.*auth\/sign-up/);
    await expect(page.locator("h1")).toContainText("Sign up");
  });

  test("should show validation errors for invalid login", async ({ page }) => {
    await page.goto("/auth/login");

    // Try to submit empty form
    await page.click('button[type="submit"]');

    // Should show validation errors
    await expect(page.locator("text=Invalid email address")).toBeVisible();
  });

  test("should show validation errors for weak password in sign up", async ({
    page,
  }) => {
    await page.goto("/auth/sign-up");

    // Fill with weak password
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "123");
    await page.fill('input[name="confirmPassword"]', "123");

    await page.click('button[type="submit"]');

    // Should show password validation error
    await expect(
      page.locator("text=Password must be at least 8 characters long")
    ).toBeVisible();
  });

  test("should show password mismatch error", async ({ page }) => {
    await page.goto("/auth/sign-up");

    // Fill with mismatched passwords
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "ValidPass123!");
    await page.fill('input[name="confirmPassword"]', "DifferentPass123!");

    await page.click('button[type="submit"]');

    // Should show password mismatch error
    await expect(page.locator("text=Passwords do not match")).toBeVisible();
  });

  test("should navigate to forgot password page", async ({ page }) => {
    await page.goto("/auth/login");
    await page.click("text=Forgot your password?");
    await expect(page).toHaveURL(/.*auth\/forgot-password/);
  });

  // Note: These tests use mock/test data.
  // For real auth testing, you'd need a test Supabase project or mock the auth service
  test("should handle OAuth button clicks", async ({ page }) => {
    await page.goto("/auth/login");

    // Check OAuth buttons are present and clickable
    await expect(page.locator("text=Google Login")).toBeVisible();
    await expect(page.locator("text=Github Login")).toBeVisible();

    // Note: Don't actually click OAuth in tests as it redirects to external services
    // In real tests, you'd mock these calls
  });
});

test.describe("Protected Routes", () => {
  test("should redirect to login when not authenticated", async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto("/dashboard");

    // Should redirect to login
    await expect(page).toHaveURL(/.*auth\/login/);
  });
});

test.describe("Navigation", () => {
  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    // Check main page loads
    await expect(page.locator("h1")).toBeVisible();

    // Check that the page has expected content
    await expect(page.locator("text=Get started by editing")).toBeVisible();
  });

  test("should be responsive", async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/auth/login");

    // Check that login form is still visible and usable on mobile
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
