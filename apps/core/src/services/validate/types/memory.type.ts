import { MemorySchema as MemorySchemaGenerated } from "@/prisma-types";
import { z } from "zod";

const MemorySchema = MemorySchemaGenerated.extend({
	key: z.string().trim().min(1).max(32),
});

export const MemoryCreateSchema = MemorySchema.pick({
	key: true,
	value: true,
}).strict();

export type MemoryCreateType = z.infer<typeof MemoryCreateSchema>;

export const MemoryUpdateSchema = MemorySchema.pick({
	key: true,
	value: true,
})
	.partial()
	.strict();

export type MemoryUpdateType = z.infer<typeof MemoryUpdateSchema>;
