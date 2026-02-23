import { test as base } from "@playwright/test";
import { LayoutPage } from "../pages/layout.page";
import { AuthPage } from "../pages/auth.page";
import { PromptsPage } from "../pages/prompts.page";
import { PlaygroundPage } from "../pages/playground.page";
import { TestcasesPage } from "../pages/testcases.page";

type Pages = {
	layoutPage: LayoutPage;
	authPage: AuthPage;
	promptsPage: PromptsPage;
	playgroundPage: PlaygroundPage;
	testcasesPage: TestcasesPage;
	interTestDelay: void;
};

export const test = base.extend<Pages>({
	interTestDelay: [
		async ({}, use) => {
			await use();
			await new Promise((resolve) => setTimeout(resolve, 2_000));
		},
		{ auto: true },
	],
	layoutPage: async ({ page }, use) => {
		await use(new LayoutPage(page));
	},
	authPage: async ({ page }, use) => {
		await use(new AuthPage(page));
	},
	promptsPage: async ({ page }, use) => {
		await use(new PromptsPage(page));
	},
	playgroundPage: async ({ page }, use) => {
		await use(new PlaygroundPage(page));
	},
	testcasesPage: async ({ page }, use) => {
		await use(new TestcasesPage(page));
	},
});

export { expect } from "@playwright/test";
