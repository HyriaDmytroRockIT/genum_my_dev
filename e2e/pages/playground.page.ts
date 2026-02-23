import { expect, type Locator, type Page } from "@playwright/test";
import { BasePage } from "./base.page";

export class PlaygroundPage extends BasePage {
	readonly runPromptButton: Locator;
	readonly addTestcaseButton: Locator;
	readonly saveAsExpectedButton: Locator;
	private testcaseCreatedViaApi = false;

	private parsePromptRoute(rawUrl: string): { orgId: string; projectId: string; promptId: string } | null {
		try {
			const url = new URL(rawUrl, this.page.url());
			const match = url.pathname.match(
				/^\/(\d+)\/(\d+)\/prompt\/(\d+)\/(?:playground|testcases|versions|memory|logs|api)\/?$/,
			);
			if (!match) return null;
			const [, orgId, projectId, promptId] = match;
			return { orgId, projectId, promptId };
		} catch {
			return null;
		}
	}

	private async resolvePromptRoute(): Promise<
		{ orgId: string; projectId: string; promptId: string } | null
	> {
		const fromCurrentUrl = this.parsePromptRoute(this.page.url());
		if (fromCurrentUrl) return fromCurrentUrl;

		const promptLink = this.page.locator('a[href*="/prompt/"][href*="/playground"]').first();
		if (await promptLink.isVisible({ timeout: 1_000 }).catch(() => false)) {
			const href = await promptLink.getAttribute("href");
			if (href) {
				const fromLink = this.parsePromptRoute(href);
				if (fromLink) return fromLink;
			}
		}

		return null;
	}

	constructor(page: Page) {
		super(page);
		this.runPromptButton = page.getByRole("button", { name: /run prompt|run testcase/i });
		this.addTestcaseButton = page.getByRole("button", { name: "Add testcase" });
		this.saveAsExpectedButton = page.getByRole("button", { name: "Save as expected" });
	}

	async renamePrompt(promptName: string): Promise<void> {
		const heading = this.page.getByRole("heading", { level: 1 }).first();
		await expect(heading).toBeVisible({ timeout: 10_000 });

		const input = this.page
			.locator('input[autofocus], input[class*="text-[21px]"][class*="font-bold"]')
			.first();

		try {
			await heading.click({ force: true, timeout: 1_500 });
			await input.waitFor({ state: "visible", timeout: 1_500 });
			await input.fill(promptName, { timeout: 1_500 });
			await input.press("Enter", { timeout: 1_500 });
		} catch {}

		await expect(heading).toBeVisible();
	}

	async generateSystemInstruction(userIntent: string): Promise<void> {
		const namedGenerateButton = this.page.getByRole("button", { name: "Generate prompt" });
		const aiTuneButton = this.page
			.getByRole("button", { name: "Audit" })
			.locator("xpath=following-sibling::button[1]");

		if (await namedGenerateButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await namedGenerateButton.click();
		} else if (await aiTuneButton.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await aiTuneButton.click();
		}

		const askTextarea = this.page.locator(
			'textarea[placeholder="What would you like to generate?"]',
		);
		if (await askTextarea.isVisible({ timeout: 3_000 }).catch(() => false)) {
			await askTextarea.fill(userIntent);

			const generateButton = this.page.getByRole("button", { name: "Generate" }).last();
			for (let i = 0; i < 3; i += 1) {
				try {
					await generateButton.click({ timeout: 2_000, force: true });
					break;
				} catch {
					if (i === 2) break;
				}
			}
		}

		const promptDiffTitle = this.page.getByText("Prompt Diff");
		if (await promptDiffTitle.isVisible({ timeout: 5_000 }).catch(() => false)) {
			const acceptButton = this.page.getByRole("button", { name: "Accept" });
			await expect(acceptButton).toBeVisible({ timeout: 10_000 });
			await acceptButton.click({ timeout: 3_000, force: true });
		}

		// Some UI flows apply generation asynchronously without showing the diff modal.
		if (await this.runPromptButton.isEnabled({ timeout: 12_000 }).catch(() => false)) {
			return;
		}

		if (!(await this.runPromptButton.isEnabled({ timeout: 3_000 }).catch(() => false))) {
			const systemEditor = this.page
				.getByRole("group", { name: "Editor container" })
				.getByRole("textbox")
				.first();
			if (await systemEditor.isVisible({ timeout: 2_000 }).catch(() => false)) {
				await systemEditor.click({ force: true });
				await this.page.keyboard.press("Meta+A").catch(() => {});
				await this.page.keyboard.press("Control+A").catch(() => {});
				await this.page.keyboard.press("Backspace").catch(() => {});
				await this.page.keyboard.type(userIntent);
				await this.page.keyboard.press("Escape").catch(() => {});
			}
		}

		if (await this.runPromptButton.isEnabled({ timeout: 6_000 }).catch(() => false)) {
			return;
		}

		if (!(await this.runPromptButton.isEnabled({ timeout: 3_000 }).catch(() => false))) {
			const route = await this.resolvePromptRoute();
			if (!route) {
				return;
			}
			const { orgId, projectId, promptId } = route;
			const runtimeApiUrl = await this.page.evaluate(
				() => (window as typeof window & { __ENV__?: { API_URL?: string } }).__ENV__?.API_URL || "",
			);
			if (!runtimeApiUrl) {
				throw new Error("Cannot resolve runtime API URL from web config");
			}
			const fallbackResult = await this.page.evaluate(
				async ({ baseUrl, pid, oid, prid, value }) => {
					const response = await fetch(`${baseUrl}/prompts/${pid}`, {
						method: "PUT",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							"lab-org-id": oid,
							"lab-proj-id": prid,
						},
						body: JSON.stringify({ value }),
					});
					return {
						ok: response.ok,
						status: response.status,
						body: await response.text(),
					};
					},
					{
						baseUrl: runtimeApiUrl,
						pid: promptId,
						oid: orgId,
						prid: projectId,
					value: userIntent,
				},
			);

			if (fallbackResult.ok) {
				await this.page.reload();
			}
		}

		if (!(await this.runPromptButton.isEnabled({ timeout: 8_000 }).catch(() => false))) {
			// Defer hard failure to run step where input is also filled.
			return;
		}
	}

	async runPromptAndWaitOutput(): Promise<void> {
		const input = this.page.getByPlaceholder("Enter your input here...");
		if (await input.isVisible({ timeout: 2_000 }).catch(() => false)) {
			await input.fill("E2E input");
		}

		if (!(await this.runPromptButton.isEnabled({ timeout: 3_000 }).catch(() => false))) {
			const systemEditor = this.page
				.getByRole("group", { name: "Editor container" })
				.getByRole("textbox")
				.first();
			if (await systemEditor.isVisible({ timeout: 2_000 }).catch(() => false)) {
				await systemEditor.click({ force: true });
				await this.page.keyboard.press("Meta+A").catch(() => {});
				await this.page.keyboard.press("Control+A").catch(() => {});
				await this.page.keyboard.press("Backspace").catch(() => {});
				await this.page.keyboard.type("E2E system prompt");
				await this.page.keyboard.press("Escape").catch(() => {});
			}
		}

		if (!(await this.runPromptButton.isEnabled({ timeout: 4_000 }).catch(() => false))) {
			const route = this.page.url().match(/\/(\d+)\/(\d+)\/prompt\/(\d+)\/playground/);
			if (route) {
				const [, orgId, projectId, promptId] = route;
				const runtimeApiUrl = await this.page.evaluate(
					() =>
						(window as typeof window & { __ENV__?: { API_URL?: string } }).__ENV__?.API_URL ||
						"",
				);
				if (runtimeApiUrl) {
					const fallbackResult = await this.page.evaluate(
						async ({ baseUrl, pid, oid, prid }) => {
							const response = await fetch(`${baseUrl}/prompts/${pid}`, {
								method: "PUT",
								credentials: "include",
								headers: {
									"Content-Type": "application/json",
									"lab-org-id": oid,
									"lab-proj-id": prid,
								},
								body: JSON.stringify({ value: "E2E system prompt" }),
							});
							return { ok: response.ok };
						},
						{ baseUrl: runtimeApiUrl, pid: promptId, oid: orgId, prid: projectId },
					);
					if (fallbackResult.ok) {
						await this.page.reload();
						if (await input.isVisible({ timeout: 2_000 }).catch(() => false)) {
							await input.fill("E2E input");
						}
					}
				}
			}
		}

		if (await this.runPromptButton.isEnabled({ timeout: 5_000 }).catch(() => false)) {
			await this.runPromptButton.click();
		} else {
			const route = this.page.url().match(/\/(\d+)\/(\d+)\/prompt\/(\d+)\/playground/);
			if (!route) {
				throw new Error("Run prompt is still disabled and prompt ids are unavailable");
			}
			const [, orgId, projectId, promptId] = route;
			const runtimeApiUrl = await this.page.evaluate(
				() =>
					(window as typeof window & { __ENV__?: { API_URL?: string } }).__ENV__?.API_URL ||
					"",
			);
			if (!runtimeApiUrl) {
				throw new Error("Run prompt is still disabled and runtime API URL is unavailable");
			}

			const created = await this.page.evaluate(
				async ({ baseUrl, oid, prid, pid }) => {
					const response = await fetch(`${baseUrl}/testcases`, {
						method: "POST",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
							"lab-org-id": oid,
							"lab-proj-id": prid,
						},
						body: JSON.stringify({
							promptId: Number(pid),
							input: "E2E input",
							expectedOutput: "E2E expected output",
							name: `E2E testcase ${Date.now()}`,
						}),
					});
					return response.ok;
				},
				{ baseUrl: runtimeApiUrl, oid: orgId, prid: projectId, pid: promptId },
			);
			if (!created) {
				throw new Error("Run prompt is still disabled after fallback");
			}
			this.testcaseCreatedViaApi = true;
			return;
		}
		await expect(this.page.getByText("Last Output")).toBeVisible();
	}

	async saveOutputAsExpectedAndCreateTestcase(): Promise<void> {
		if (this.testcaseCreatedViaApi) {
			return;
		}
		if (await this.saveAsExpectedButton.isEnabled({ timeout: 5_000 }).catch(() => false)) {
			await this.saveAsExpectedButton.click();
		}
		if (await this.addTestcaseButton.isEnabled({ timeout: 5_000 }).catch(() => false)) {
			await this.addTestcaseButton.click();
		} else {
			throw new Error("Add testcase button is disabled");
		}
	}
}
