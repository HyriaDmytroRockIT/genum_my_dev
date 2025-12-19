import { z } from "zod";

export const AuthNewUserSchema = z
	.object({
		email: z.string().email(),
		name: z.string(),
		authID: z.string(),
		picture: z.string().optional(),
		created_at: z.string().datetime(),
		ip: z.string().optional(),
		geo: z.string().optional(),
	})
	.strict();

export type AuthNewUserType = z.infer<typeof AuthNewUserSchema>;

export const NewNotificationSchema = z
	.object({
		title: z.string(),
		content: z.string(),
	})
	.strict();

export type NewNotificationType = z.infer<typeof NewNotificationSchema>;
