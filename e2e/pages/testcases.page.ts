import { expect, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class TestcasesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async expectHasAtLeastOneTestcase(): Promise<void> {
    await expect(this.page.getByText(/Testcase/i)).toBeVisible();
  }
}
