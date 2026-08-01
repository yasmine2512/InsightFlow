import { test, expect } from "@playwright/test";
test.describe("Load Orders", () => {
     test("user can access orders page", async ({ page }) => {
     await page.goto("/orders");
    await expect(page).toHaveURL(/orders/);
    await expect(
  page.getByRole("heading", { name: "Orders", exact: true })
).toBeVisible();
  });
})