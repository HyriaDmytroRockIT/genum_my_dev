import { z } from "zod";

export const RunPromptSchema = z
	.object({
		id: z.coerce.number().int().positive(),
		question: z.string(),
		memoryKey: z.string().optional(),
		createTicket: z.coerce.boolean().optional().default(false), // todo remove this
		productive: z.coerce.boolean().optional().default(true),
	})
	.strict();

export type RunPromptType = z.infer<typeof RunPromptSchema>;

export const GetPromptQuerySchema = z
	.object({
		// custom rules. zod doesn't support boolean in query params
		productive: z
			.union([
				z.literal("true").transform(() => true),
				z.literal("false").transform(() => false),
				z.literal("1").transform(() => true),
				z.literal("0").transform(() => false),
				z.boolean(),
			])
			.optional()
			.default(true),
	})
	.strict();

export type GetPromptQueryType = z.infer<typeof GetPromptQuerySchema>;
