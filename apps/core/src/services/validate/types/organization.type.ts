import { z } from "zod";
import {
	OrganizationSchema as OrganizationSchemaGenerated,
	OrganizationMemberSchema,
	OrganizationApiKeySchema,
} from "@/prisma-types";
import { OrganizationRole } from "@/prisma";

const OrganizationSchema = OrganizationSchemaGenerated.extend({
	name: z.string().trim().min(1).max(128),
	description: z.string().trim().max(7_000).default(""),
});

export const OrganizationCreateSchema = OrganizationSchema.omit({
	id: true,
	personal: true,
}).strict();

export type OrganizationCreateType = z.infer<typeof OrganizationCreateSchema>;

export const OrganizationUpdateSchema = OrganizationCreateSchema.partial().strict();

export type OrganizationUpdateType = z.infer<typeof OrganizationUpdateSchema>;

export const OrganizationMemberUpdateSchema = OrganizationMemberSchema.omit({
	id: true,
	organizationId: true,
	userId: true,
})
	.extend({
		role: z.nativeEnum(OrganizationRole),
	})
	.strict();

export type OrganizationMemberUpdateType = z.infer<typeof OrganizationMemberUpdateSchema>;

export const OrganizationMemberInviteSchema = z
	.object({
		email: z.string().email({ message: "Invalid email address" }),
		// role: z.nativeEnum(OrganizationRole).default(OrganizationRole.READER),
		// feature: teamwork
		role: z.nativeEnum(OrganizationRole).default(OrganizationRole.ADMIN),
	})
	.strict();

export type OrganizationMemberInviteType = z.infer<typeof OrganizationMemberInviteSchema>;

export const OrganizationApiKeyCreateSchema = OrganizationApiKeySchema.pick({
	vendor: true,
	key: true,
}).strict();

export type OrganizationApiKeyCreateType = z.infer<typeof OrganizationApiKeyCreateSchema>;

export const OrganizationUsageStatsSchema = z
	.object({
		fromDate: z.coerce.date(),
		toDate: z.coerce.date(),
		projectId: z.coerce.number().int().positive().optional(),
	})
	.partial()
	.strict();

export type OrganizationUsageStatsType = z.infer<typeof OrganizationUsageStatsSchema>;
