import type { Prompt } from "@/prisma";
import { createHash } from "node:crypto";

export function commitHash(prompt: Prompt, generations: number) {
	const values = {
		promptInstructions: prompt.value,
		promptLanguageModelId: prompt.languageModelId,
		promptLanguageModelConfig: prompt.languageModelConfig,
		generations: generations,
	};

	const hash = createHash("sha256").update(JSON.stringify(values)).digest("hex");

	return hash as string;
}
