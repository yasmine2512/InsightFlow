import { test, expect } from "@playwright/test";
test.describe("Login", () => {

    test("shows validation when fields are empty", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByText(/email is required/i)).toBeVisible();
    });

    test("shows error for invalid email", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("hello");
    await page.getByLabel(/password/i).fill("somepassword");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByText(/valid email/i)).toBeVisible();
    });

    test("shows error for wrong password", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("test@test1.com");
    await page.getByLabel(/password/i).fill("wrong-password");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page.getByText(/wrong password/i)).toBeVisible();
    });

    test("user can login successfully", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("test@test2.com");
    await page.getByLabel(/password/i).fill("test123");
    await page.getByRole("button", { name: /Sign In/i }).click();
    await expect(page).toHaveURL(/dashboard/);
    });
  
})