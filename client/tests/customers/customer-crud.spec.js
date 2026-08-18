import { test, expect } from "@playwright/test";
test.describe("Customer Operations", () => {
    test("user can create, update and delete a customer", async ({ page }) => {
    await page.goto("/customers");

    //Create Customer
    await page.getByRole("button", { name: /add customer/i }).click();
    const dialog = page.getByRole("dialog", {name: "Add Customer",});
    await dialog.getByLabel(/name/i).fill("Playwright Customer");
    await dialog.getByLabel(/email/i).fill("playwright.customer@test.com");
    await dialog.getByLabel(/phone/i).fill("0555555557");
    await dialog.getByLabel(/Address/i).fill("test Address");
    await dialog.getByRole("button", {name: "Add Customer"}).click();
    const successDialog = page.getByRole("dialog", {name: "Success!"});
    const errorPopup = page.getByRole("dialog", { name: /error/i });
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await expect(successDialog).toBeVisible();
    await successDialog.getByRole("button", { name: /Continu/i }).click();
    await expect(page.getByText("playwright.customer@test.com")).toBeVisible();

    //Update Customer
    const customer = page.getByRole("row").filter({ hasText: "playwright.customer@test.com" });
    await customer.getByRole("button", {name: "Edit customer"}).click();
    const editDialog = page.getByRole("dialog", {name: "Edit Customer",});
    await editDialog.getByLabel(/name/i).fill("Updated Playwright Customer");
    await editDialog.getByRole("button", { name: /Update Customer/i }).click();
    await successDialog.getByRole("button", { name: /Continu/i }).click();
    await expect(page.getByText("Updated Playwright Customer")).toBeVisible();

    //Delete Customer
    await customer.getByRole("button", {name: "Delete customer"}).click();
    const deleteDialog = page.getByRole("dialog", {name: "Delete The Customer"});
    await deleteDialog.getByRole("button", {name: "Delete"}).click();
    await expect(page.getByText("Updated Playwright Customer")).not.toBeVisible();
  });
})