import { test, expect } from "@playwright/test";

test.describe("Create Order From Product", () => {
  test("user can create an order from a product", async ({ page }) => {
    await page.goto("/catalog");
    await page.getByRole("link").filter({ hasText: "Mechanical Keyboard TKL" }).click();
    await expect(page).toHaveURL(/\/catalog\/.+/);
    await page.getByRole("button", {name: /create order/i}).click();
    const dialog = page.getByRole("dialog", {name: "Create Order"});
    await dialog.getByLabel("Customer Name").fill("Playwright Order Customer");
    await dialog.getByLabel("Customer Email").fill("playwright.order2@test.com");
    await dialog.getByLabel("Customer Phone").fill("0555555555");
    await dialog.getByLabel("Quantity").fill("1");
    await dialog.getByLabel("Customer Address").fill("Playwright Test Address");
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
    await page.goto("/orders");
    const order = page.getByRole("row").filter({ hasText: "Playwright Order Customer" });
    await order.getByRole("button", { name: "Delete order" }).click();
    const deleteDialog = page.getByRole("dialog", {name: "Delete The Order"});
    await deleteDialog.getByRole("button", {name: "Delete"}).click();
    await expect(page.getByText("Playwright Customer")).not.toBeVisible();
  });

});