import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Import Orders", () => {

  test("user can import orders from Excel", async ({ page }) => {
    await page.goto("/orders");

    // Import Orders
    await page.getByRole("button", {name: /import excel/i}).click();
    const dialog = page.getByRole("dialog", {name: "Import Orders"});
    await expect(dialog).toBeVisible();
    const filePath = path.join(process.cwd(),"tests","fixtures","test-orders.xlsx");
    await dialog.locator('input[type="file"]').setInputFiles(filePath);
    const successDialog = page.getByRole("dialog", {name: "Success!"});
    const errorPopup = page.getByRole("dialog", { name: /error/i });
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await expect(successDialog).toBeVisible();
    await expect(successDialog.getByText("Import completed successfully. 2 orders created.")).toBeVisible();
    await successDialog.getByRole("button", {name: /Continu/i}).click();

    //Delete Orders
    let order = page.getByRole("row").filter({ hasText: "John Doe" });
    await order.getByRole("button", { name: "Delete order" }).click();
    let deleteDialog = page.getByRole("dialog", {name: "Delete The Order"});
    await deleteDialog.getByRole("button", {name: "Delete"}).click();
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await successDialog.getByRole("button", {name: /Continu/i}).click();
    order = page.getByRole("row").filter({ hasText: "Jane Smith" });
    await order.getByRole("button", { name: "Delete order" }).click();
    deleteDialog = page.getByRole("dialog", {name: "Delete The Order"});
    await deleteDialog.getByRole("button", {name: "Delete"}).click();
    await page.waitForTimeout(500);
    if (await errorPopup.isVisible()) {
    console.log("ERROR POPUP TEXT:");
    console.log(await errorPopup.innerText());
    }
    await successDialog.getByRole("button", {name: /Continu/i}).click();

  //Delete Customers
    await page.goto("/customers");
    let customer = page.getByRole("row").filter({ hasText: "John Doe" });
    await customer.getByRole("button", {name: "Delete customer"}).click();
    deleteDialog = page.getByRole("dialog", {name: "Delete The Customer"});
    await deleteDialog.getByRole("button", {name: "Delete"}).click();
    await expect(page.getByText("John Doe")).not.toBeVisible();
    await successDialog.getByRole("button", {name: /Continu/i}).click();
    customer = page.getByRole("row").filter({ hasText: "Jane Smith" });
    await customer.getByRole("button", {name: "Delete customer"}).click();
    await deleteDialog.getByRole("button", {name: "Delete"}).click();
    await expect(page.getByText("Jane Smith")).not.toBeVisible();
    
  });

});