import { test, expect } from "@playwright/test";
test.describe("Load Customers", () => {
     test("user can access customers page", async ({ page }) => {
    await page.goto("/customers");
    await expect(
  page.getByRole("heading", { name: "Customers", exact: true })
).toBeVisible();
  });
})