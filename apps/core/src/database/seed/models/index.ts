import { AiVendor } from "@/prisma";
import { db } from "@/database/db";

export type LanguageModelData = {
	name: string;
	displayName?: string;
	vendor: AiVendor;
	promptPrice: number;
	completionPrice: number;
	contextTokensMax: number;
	completionTokensMax: number;
	description: string;
};

export const DEFAULT_LANGUAGE_MODELS_DATA: LanguageModelData[] = [
	{
		name: "gpt-4o",
		displayName: "GPT-4o",
		vendor: AiVendor.OPENAI,
		promptPrice: 2.5,
		completionPrice: 10,
		contextTokensMax: 128000,
		completionTokensMax: 16384,
		description:
			"GPT-4o (“o” for “omni”) is our versatile, high-intelligence flagship model. It accepts both text and image inputs, and produces text outputs (including Structured Outputs). It is the best model for most tasks, and is our most capable model outside of our o-series models.",
	},
	{
		name: "gpt-5-mini",
		displayName: "GPT-5 mini",
		vendor: AiVendor.OPENAI,
		promptPrice: 0.25,
		completionPrice: 2,
		contextTokensMax: 400000,
		completionTokensMax: 128000,
		description:
			"GPT-5 mini is a faster, more cost-efficient version of GPT-5. It's great for well-defined tasks and precise prompts.",
	},
	{
		name: "gpt-5-nano",
		displayName: "GPT-5 nano",
		vendor: AiVendor.OPENAI,
		promptPrice: 0.05,
		completionPrice: 0.4,
		contextTokensMax: 400000,
		completionTokensMax: 128000,
		description:
			"GPT-5 Nano is our fastest, cheapest version of GPT-5. It's great for summarization and classification tasks.",
	},
	{
		name: "claude-3-7-sonnet-latest",
		displayName: "Claude 3.7 Sonnet",
		vendor: AiVendor.ANTHROPIC,
		promptPrice: 3,
		completionPrice: 15,
		contextTokensMax: 200000,
		completionTokensMax: 64000,
		description:
			"First hybrid reasoning model on the market. Offers both quick responses and extended, step-by-step reasoning. Enhanced coding and front-end web development capabilities",
	},
	{
		name: "claude-sonnet-4-5",
		displayName: "Claude Sonnet 4.5",
		vendor: AiVendor.ANTHROPIC,
		promptPrice: 3,
		completionPrice: 15,
		contextTokensMax: 200000,
		completionTokensMax: 64000,
		description: "Best model for complex agents and coding",
	},
	{
		name: "claude-sonnet-4-0",
		displayName: "Claude Sonnet 4.0",
		vendor: AiVendor.ANTHROPIC,
		promptPrice: 3,
		completionPrice: 15,
		contextTokensMax: 200000,
		completionTokensMax: 64000,
		description:
			"Balances performance and efficiency for internal and external use cases, with enhanced steerability for greater control over implementations. While not matching Opus 4 in most domains, it delivers an optimal mix of capability and practicality.",
	},
	{
		name: "gpt-5-pro",
		displayName: "GPT-5 pro",
		vendor: AiVendor.OPENAI,
		promptPrice: 15,
		completionPrice: 120,
		contextTokensMax: 400000,
		completionTokensMax: 272000,
		description:
			"GPT-5 pro uses more compute to think harder and provide consistently better answers.",
	},
	{
		name: "o3-pro",
		displayName: "o3 pro",
		vendor: AiVendor.OPENAI,
		promptPrice: 20,
		completionPrice: 80,
		contextTokensMax: 200000,
		completionTokensMax: 100000,
		description:
			"The o3-pro model uses more compute to think harder and provide consistently better answers.",
	},
	{
		name: "o3",
		displayName: "o3",
		vendor: AiVendor.OPENAI,
		promptPrice: 2,
		completionPrice: 8,
		contextTokensMax: 200000,
		completionTokensMax: 100000,
		description:
			"o3 is a well-rounded and powerful model across domains. It sets a new standard for math, science, coding, and visual reasoning tasks. It also excels at technical writing and instruction-following.",
	},
	{
		name: "gpt-5.1",
		displayName: "GPT-5.1",
		vendor: AiVendor.OPENAI,
		promptPrice: 1.25,
		completionPrice: 10,
		contextTokensMax: 400000,
		completionTokensMax: 128000,
		description:
			"GPT-5.1 is our flagship model for coding and agentic tasks with configurable reasoning and non-reasoning effort.",
	},
	{
		name: "gpt-4.1-mini",
		displayName: "GPT-4.1 mini",
		vendor: AiVendor.OPENAI,
		promptPrice: 0.4,
		completionPrice: 1.6,
		contextTokensMax: 1047576,
		completionTokensMax: 32768,
		description:
			"GPT-4.1 mini provides a balance between intelligence, speed, and cost that makes it an attractive model for many use cases.",
	},
	{
		name: "gpt-4.1-nano",
		displayName: "GPT-4.1 nano",
		vendor: AiVendor.OPENAI,
		promptPrice: 0.1,
		completionPrice: 0.4,
		contextTokensMax: 1047576,
		completionTokensMax: 32768,
		description: "GPT-4.1 nano is the fastest, most cost-effective GPT-4.1 model.",
	},
	{
		name: "o4-mini",
		displayName: "o4 mini",
		vendor: AiVendor.OPENAI,
		promptPrice: 1.1,
		completionPrice: 4.4,
		contextTokensMax: 200000,
		completionTokensMax: 100000,
		description:
			"o4-mini is our latest small o-series model. It's optimized for fast, effective reasoning with exceptionally efficient performance in coding and visual tasks.",
	},
	{
		name: "gpt-4o-mini",
		displayName: "GPT-4o mini",
		vendor: AiVendor.OPENAI,
		promptPrice: 0.15,
		completionPrice: 0.6,
		contextTokensMax: 128000,
		completionTokensMax: 16384,
		description:
			"OpenAI's most cost-efficient small model that’s smarter and cheaper than GPT-3.5 Turbo",
	},
	{
		name: "o3-mini",
		displayName: "o3 mini",
		vendor: AiVendor.OPENAI,
		promptPrice: 1.1,
		completionPrice: 4.4,
		contextTokensMax: 200000,
		completionTokensMax: 100000,
		description:
			"o3-mini is our newest small reasoning model, providing high intelligence at the same cost and latency targets of o1-mini. ",
	},
	{
		name: "gpt-4.1",
		displayName: "GPT-4.1",
		vendor: AiVendor.OPENAI,
		promptPrice: 2,
		completionPrice: 8,
		contextTokensMax: 1047576,
		completionTokensMax: 32768,
		description:
			"GPT-4.1 is our flagship model for complex tasks. It is well suited for problem solving across domains.",
	},
	{
		name: "gemini-2.0-flash",
		displayName: "Gemini 2.0 Flash",
		vendor: AiVendor.GOOGLE,
		promptPrice: 0.1,
		completionPrice: 0.7,
		contextTokensMax: 1048576,
		completionTokensMax: 8192,
		description:
			"Delivers next-gen features and improved capabilities, including superior speed, native tool use, multimodal generation, and a 1M token context window.",
	},
	{
		name: "gemini-2.0-flash-lite",
		displayName: "Gemini 2.0 Flash Lite",
		vendor: AiVendor.GOOGLE,
		promptPrice: 0.075,
		completionPrice: 0.3,
		contextTokensMax: 1048576,
		completionTokensMax: 8192,
		description: "A Gemini 2.0 Flash model optimized for cost efficiency and low latency.",
	},
	{
		name: "gemini-2.5-flash",
		displayName: "Gemini 2.5 Flash",
		vendor: AiVendor.GOOGLE,
		promptPrice: 0.3,
		completionPrice: 2.5,
		contextTokensMax: 1048576,
		completionTokensMax: 65536,
		description:
			"Gemini 2.5 Flash is Google's best model in terms of price-performance, offering well-rounded capabilities.",
	},
	{
		name: "gemini-2.5-pro",
		displayName: "Gemini 2.5 Pro",
		vendor: AiVendor.GOOGLE,
		promptPrice: 1.25,
		completionPrice: 10,
		contextTokensMax: 1048576,
		completionTokensMax: 65536,
		description:
			"Gemini 2.5 Pro is Google's state-of-the-art thinking model, capable of reasoning over complex problems in code, math, and STEM, as well as analyzing large datasets, codebases, and documents using long context.",
	},
	{
		name: "gemini-2.5-flash-lite",
		displayName: "Gemini 2.5 Flash Lite",
		vendor: AiVendor.GOOGLE,
		promptPrice: 0.1,
		completionPrice: 0.4,
		contextTokensMax: 1048576,
		completionTokensMax: 65536,
		description: "A Gemini 2.5 Flash model optimized for cost efficiency and low latency.",
	},
	{
		name: "gpt-5",
		displayName: "GPT-5",
		vendor: AiVendor.OPENAI,
		promptPrice: 1.25,
		completionPrice: 10,
		contextTokensMax: 400000,
		completionTokensMax: 128000,
		description:
			"GPT-5 is flagship model for coding, reasoning, and agentic tasks across domains.",
	},
	{
		name: "gemini-3-pro-preview",
		displayName: "Gemini 3 Pro Preview",
		vendor: AiVendor.GOOGLE,
		promptPrice: 2,
		completionPrice: 12,
		contextTokensMax: 1048576,
		completionTokensMax: 65536,
		description:
			"Gemini 3 is our most intelligent model family to date, built on a foundation of state-of-the-art reasoning.",
	},
	{
		name: "gpt-5.2",
		displayName: "GPT-5.2",
		vendor: AiVendor.OPENAI,
		promptPrice: 1.75,
		completionPrice: 14,
		contextTokensMax: 400000,
		completionTokensMax: 128000,
		description: "GPT-5.2 is flagship model for coding and agentic tasks across industries.",
	},
];

/**
 * sync language models
 * creates new models and updates existing ones if they differ
 */
export async function syncModels(): Promise<void> {
	const models = DEFAULT_LANGUAGE_MODELS_DATA;
	const existingModels = await db.prompts.getModels();

	const toCreate: LanguageModelData[] = [];
	const toUpdate: LanguageModelData[] = [];

	for (const model of models) {
		const existing = existingModels.find(
			(e) => e.name === model.name && e.vendor === model.vendor,
		);

		if (!existing) {
			toCreate.push(model);
		} else {
			// Check if any field is different
			const isDifferent =
				existing.displayName !== (model.displayName ?? null) ||
				existing.promptPrice !== model.promptPrice ||
				existing.completionPrice !== model.completionPrice ||
				existing.contextTokensMax !== model.contextTokensMax ||
				existing.completionTokensMax !== model.completionTokensMax ||
				existing.description !== model.description;

			if (isDifferent) {
				toUpdate.push(model);
			}
		}
	}

	if (toCreate.length === 0 && toUpdate.length === 0) {
		console.log(`${existingModels.length} models checked. All up to date.`);
		return;
	}

	if (toCreate.length > 0) {
		console.log(`Creating ${toCreate.length} models...`);
		await Promise.all(toCreate.map((model) => db.prompts.createModel(model)));
	}

	if (toUpdate.length > 0) {
		console.log(`Updating ${toUpdate.length} models...`);
		await Promise.all(toUpdate.map((model) => db.prompts.updateModel(model)));
	}

	console.log(
		`Language models sync complete: ${toCreate.length} created, ${toUpdate.length} updated.`,
	);
}
