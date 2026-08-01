import { test, expect } from "@playwright/test";
test.describe("Product Operations", () => {
    test("user can create, update and delete a product", async ({ page }) => {

    // Create Product
    await page.goto("/products");
    await page.getByRole("button", { name: /add product/i }).click();
    const dialog = page.getByRole("dialog", {name: "Add Product",});
    await dialog.getByLabel("Product Name").fill("Playwright Product");
    await dialog.getByLabel("Price").fill("100");
    await dialog.getByLabel("Category").fill("Testing");
    await dialog.getByLabel("Stock").fill("10");
    await dialog.getByLabel("Sku").fill("PW-TEST-001");
    await dialog.getByLabel("Description").fill("Product created by Playwright");
    await dialog.getByLabel("Features").fill("Feature 1\nFeature 2");
    await dialog.getByRole("button", {  name: "Add Product",}).click();
    const successDialog = page.getByRole("dialog", {name: "Success!",});
    await expect(successDialog).toBeVisible();
    await successDialog.getByRole("button", { name: /Continu/i }).click();
    await expect(page.getByText("Playwright Product")).toBeVisible();

    // Update Product
    await page.goto("/catalog");
    await page.getByRole("link").filter({ hasText: "Playwright Product" }).click();
    await expect(page).toHaveURL(/\/catalog\/.+/);
    await page.getByRole("button", { name: /edit/i }).click();
    const editDialog = page.getByRole("dialog", {name: "Edit Product",});
    await editDialog.getByLabel("Product Name").fill("Updated Playwright Product");
    await editDialog.getByRole("button", {name: /Update Product/i}).click();
    await successDialog.getByRole("button", { name: /Continu/i }).click();
    await expect(page.getByText("Updated Playwright Product")).toBeVisible();

    // Delete Product
    await page.getByRole("button", {name: "Delete product"}).click();
    const deleteDialog = page.getByRole("dialog", { name: "Delete The Product"});
    await deleteDialog.getByRole("button", { name: "Delete"}).click();
    await successDialog.getByRole("button", { name: /Continu/i }).click();
    await expect(page).toHaveURL(/\/catalog$/);
    await expect(page.getByRole("link", {name: /Updated Playwright Product/i,})).not.toBeVisible();
  });
});