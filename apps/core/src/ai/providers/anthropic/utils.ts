import type { FunctionCall } from "@/ai/models/types";

export function mapToolsAnthropic(tools: FunctionCall[]) {
	return tools.map((tool) => ({
		name: tool.name,
		description: tool.description,
		input_schema: {
			...tool.parameters,
			type: "object" as const, // This is a workaround to fix the type error
		},
	}));
}
