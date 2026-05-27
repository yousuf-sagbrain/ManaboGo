/**
 * Playwright E2E smoke tests — Phase 0 stubs.
 * Full E2E coverage will be added in Phase 2+.
 */

import { test, expect } from "@playwright/test";

test.describe("Public pages smoke tests", () => {
  test("landing page loads and has correct <title>", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ManaboGo/);
    // Hero headline should be visible
    await expect(page.getByText("Learn Japanese.")).toBeVisible();
  });

  test("/login page renders without errors", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("/verify/test-id shows certificate not found message", async ({ page }) => {
    await page.goto("/verify/non-existent-cert-id-12345");
    await expect(
      page.getByText(/certificate not found|has been revoked/i)
    ).toBeVisible();
  });

  test("/register page has all required fields", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible();
  });

  test("/pricing page renders price tiers", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText("Free")).toBeVisible();
    await expect(page.getByText("Pro")).toBeVisible();
  });

  test("/dashboard redirects unauthenticated users to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });
});
