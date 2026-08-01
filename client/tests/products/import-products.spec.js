import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Import Products", () => {

  test("user can import products from Excel", async ({ page }) => {
    await page.goto("/products");

    // Import products
    await page.getByRole("button", {name: /import excel/i}).click();
    const dialog = page.getByRole("dialog", {name: "Import Products"});
    await expect(dialog).toBeVisible();
    const filePath = path.join(process.cwd(),"tests","fixtures","test-products.xlsx");
    await dialog.locator('input[type="file"]').setInputFiles(filePath);
    const successDialog = page.getByRole("dialog", {name: "Success!"});
    const errorPopup = page.getByRole("dialog", { name: /error/i });
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await expect(successDialog).toBeVisible();
    await expect(successDialog.getByText("Import completed successfully. 2 Products created.")).toBeVisible();
    await successDialog.getByRole("button", {name: /Continu/i}).click();

    //Delete Products
    await page.goto("/catalog");
    await page.getByRole("link").filter({ hasText: "TEST-PROD-1" }).click();
    await expect(page).toHaveURL(/\/catalog\/.+/);
    await page.getByRole("button", {name: "Delete product"}).click();
    let deleteDialog = page.getByRole("dialog", { name: "Delete The Product"});
    await deleteDialog.getByRole("button", { name: "Delete"}).click();
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await successDialog.getByRole("button", { name: /Continu/i }).click();
    await expect(page).toHaveURL(/\/catalog$/);
    await expect(page.getByRole("link", {name: /TEST-PROD-1/i,})).not.toBeVisible();
     await page.getByRole("link").filter({ hasText: "TEST-PROD-2" }).click();
    await expect(page).toHaveURL(/\/catalog\/.+/);
    await page.getByRole("button", {name: "Delete product"}).click();
    deleteDialog = page.getByRole("dialog", { name: "Delete The Product"});
    await deleteDialog.getByRole("button", { name: "Delete"}).click();
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await successDialog.getByRole("button", { name: /Continu/i }).click();
    await expect(page).toHaveURL(/\/catalog$/);
    await expect(page.getByRole("link", {name: /TEST-PROD-2/i,})).not.toBeVisible();
   
    
  });

});