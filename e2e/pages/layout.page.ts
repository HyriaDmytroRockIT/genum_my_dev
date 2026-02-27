import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class LayoutPage extends BasePage {
  readonly navGettingStarted: Locator;
  readonly navPrompts: Locator;
  readonly navTestcases: Locator;

  constructor(page: Page) {
    super(page);
    this.navGettingStarted = page.locator('a[data-sidebar="menu-button"]', { hasText: "Getting Started" });
    this.navPrompts = page.locator('a[data-sidebar="menu-button"]', { hasText: "Prompts" });
    this.navTestcases = page.locator('a[data-sidebar="menu-button"]', { hasText: "Testcases" });
  }

  async openHome(): Promise<void> {
    await this.page.goto("/");
    await expect(this.page).toHaveURL(/\/getting-started$/);
  }

  async goToPrompts(): Promise<void> {
    await this.navPrompts.click();
    await expect(this.page).toHaveURL(/\/prompts$/);
  }

  async goToTestcases(): Promise<void> {
    await this.navTestcases.click();
    await expect(this.page).toHaveURL(/\/testcases$/);
  }

  async logoutByUserEmail(email: string): Promise<void> {
    await this.page.getByText(email).first().click();
    await this.page.getByText("Log out").click();
    await expect(this.page).toHaveURL(/\/login/);
  }
}
