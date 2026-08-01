import { test, expect } from "@playwright/test";
test.describe("Create Order", () => {
    test("user can create an order with two products and delete it", async ({ page }) => {
    await page.goto("/orders");
    // Create Order
    await page.getByRole("button", {name: /add order/i}).click();
    const dialog = page.getByRole("dialog", {name: "Create New Order"});
    await dialog.getByLabel("Customer Name").fill("Playwright Customer");
    await dialog.getByLabel("Customer Email").fill("playwright.order@test.com");
    await dialog.getByLabel("Customer Phone").fill("0555555555");
    await dialog.getByLabel("Customer Address").fill("Playwright Test Address");
    const productSelects = dialog.locator("select");
    const quantities = dialog.locator('input[type="number"]');
    await productSelects.nth(0).selectOption({index: 1});
    await quantities.nth(0).fill("1");
    await dialog.getByRole("button", {name: /add product row/i }).click();
    await expect(productSelects).toHaveCount(2);
    await expect(quantities).toHaveCount(2);
    await productSelects.nth(1).selectOption({index: 2});
    await quantities.nth(1).fill("1");
    await dialog.getByRole("button", {name: "Create Order"}).click();
    const successDialog = page.getByRole("dialog", {name: "Success!"});
    const errorPopup = page.getByRole("dialog", { name: /error/i });
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await expect(successDialog).toBeVisible();
    await successDialog.getByRole("button", {name: /Continu/i}).click();

    // Delete Order
    const order = page.getByRole("row").filter({ hasText: "Playwright Customer" });
    await order.getByRole("button", { name: "Delete order" }).click();
    const deleteDialog = page.getByRole("dialog", {name: "Delete The Order"});
    await deleteDialog.getByRole("button", {name: "Delete"}).click();
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await successDialog.getByRole("button", {name: /Continu/i}).click();
    await expect(page.getByText("Playwright Customer")).not.toBeVisible();
  });
})