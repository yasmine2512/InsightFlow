import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await page.goto("/login");

  await page.getByLabel(/email/i).fill("test@test2.com");
  await page.getByLabel(/password/i).fill("test123");

  await page.getByRole("button", { name: /Sign In/i }).click();
  await expect(page).toHaveURL(/dashboard/);
  
  await page.context().storageState({
    path: authFile,
  });
});