import { test, expect } from "@playwright/test";
test.describe("Load Products", () => {
     test("user can access products page", async ({ page }) => {
     await page.goto("/products");
     await expect(page).toHaveURL(/products/);
     await expect(page.getByRole("heading", { name: "Products", exact: true })
        ).toBeVisible();
     await page.goto("/catalog");
     await expect(page).toHaveURL(/catalog/);
     await expect(page.getByRole("heading", { name: "Products", exact: true })
        ).toBeVisible();

  });
})